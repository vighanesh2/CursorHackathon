import { NextResponse } from "next/server";
import { catalogNames, findCatalogFont, googleFontCssUrl } from "@/lib/google-fonts";
import { generateFontBrief } from "@/lib/groq";
import type { FontOption } from "@/types/design";

const WEIGHT_NAMES: Record<number, string> = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extrabold",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      name?: string;
      moodboardTitle?: string;
      thesis?: string;
      materials?: string;
    };

    const prompt = body.prompt?.trim();
    const name = body.name?.trim();
    const moodboardTitle = body.moodboardTitle?.trim();

    if (!prompt || !name || !moodboardTitle) {
      return NextResponse.json({ error: "Pick a moodboard first." }, { status: 400 });
    }

    const choices = await generateFontBrief({
      prompt,
      name,
      moodboardTitle,
      thesis: body.thesis?.trim() ?? "",
      materials: body.materials?.trim() ?? "",
      catalog: catalogNames(),
    });

    const fonts: FontOption[] = [];
    const used = new Set<string>();

    for (const choice of choices) {
      const catalog = findCatalogFont(choice.family);
      if (!catalog || used.has(catalog.family)) continue;
      used.add(catalog.family);
      fonts.push({
        id: crypto.randomUUID(),
        family: catalog.family,
        cssUrl: googleFontCssUrl(catalog),
        weights: [...catalog.weights],
        italic: catalog.italic,
        thesis: choice.thesis,
        sampleHeadline: choice.sampleHeadline,
        sampleBody: choice.sampleBody,
      });
    }

    if (fonts.length < 3) {
      for (const font of catalogNames()) {
        if (fonts.length >= 3) break;
        const catalog = findCatalogFont(font);
        if (!catalog || used.has(catalog.family)) continue;
        used.add(catalog.family);
        fonts.push({
          id: crypto.randomUUID(),
          family: catalog.family,
          cssUrl: googleFontCssUrl(catalog),
          weights: [...catalog.weights],
          italic: catalog.italic,
          thesis: "A contrast cut from the same Google Fonts catalog.",
          sampleHeadline: name,
          sampleBody: prompt,
        });
      }
    }

    return NextResponse.json({ fonts, weightNames: WEIGHT_NAMES });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load fonts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
