import { NextResponse } from "next/server";
import { generateMoodboardBrief } from "@/lib/groq";
import { findPhoto } from "@/lib/photos";
import type { Moodboard, MoodboardSession, MoodboardTile } from "@/types/design";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Describe the company or site first." }, { status: 400 });
    }

    const brief = await generateMoodboardBrief(prompt);

    const moodboards: Moodboard[] = await Promise.all(
      brief.moodboards.map(async (board) => {
        const queries = board.tiles.slice(0, 8);
        while (queries.length < 8) {
          queries.push(prompt);
        }

        const tiles: MoodboardTile[] = await Promise.all(
          queries.map(async (query) => ({
            query,
            imageUrl: (await findPhoto(query, prompt)) ?? "",
          })),
        );

        const photos = tiles.map((tile) => tile.imageUrl).filter(Boolean);

        return {
          id: crypto.randomUUID(),
          title: board.title,
          thesis: board.thesis,
          tiles,
          dna: { ...board.dna, photos },
        };
      }),
    );

    const session: MoodboardSession = {
      name: brief.name,
      prompt: brief.prompt,
      moodboards,
    };

    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate moodboards.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
