import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DesignDna } from "@/types/design";

export function collectionSlug(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled";
}

export function collectionsDir() {
  return path.join(process.cwd(), "you-i", "collections");
}

export function renderStyleGuide(input: {
  name: string;
  prompt: string;
  moodboardTitle: string;
  dna: DesignDna;
}) {
  const { name, prompt, moodboardTitle, dna } = input;
  const palette = dna.palette;
  const font = dna.font;
  const buttons = dna.buttons;
  const motion = dna.textMotion;
  const photos = dna.photos ?? [];

  return `# You-i collection · ${name}

Use this Design DNA as the source of truth for any UI you build. Do not invent a generic AI look.

**Images in this file are moodboard inspiration only.** Do not embed them, hotlink them, or collage them into the product UI. Extract color, material, and lighting; then build the interface with type, flat palette, buttons, and motion.

## Brief
${prompt}

## Moodboard
${moodboardTitle}
${dna.materials}

## Palette (flat colors only, never gradients as decoration)
- canvas: ${palette.canvas}
- ink: ${palette.ink}
- accent: ${palette.accent}
- mute: ${palette.mute}
- field: ${palette.field}

## Type
- family: ${font?.family ?? dna.type.display}
- weights: ${(font?.weights ?? [400, 700]).join(", ")}
- italic: ${font?.italic ? "yes" : "no"}
- css: ${font?.cssUrl ?? ""}
Load this Google Font and use it for headlines, body, and controls. Do not substitute Inter, Roboto, Arial, Geist, Poppins, Montserrat, Plus Jakarta Sans, or Space Grotesk.

## Buttons
- system: ${buttons?.title ?? "Square cut"}
- radius: ${buttons?.radius ?? 0}px
- border width: ${buttons?.borderWidth ?? 2}px
- primary: fill accent, text field
- secondary: transparent, ink border, ink text
- tertiary: no fill, no border, mute text, underline

## Text motion
- ${motion?.title ?? "none"}: ${motion?.thesis ?? dna.motion}

## Materials and layout
- materials: ${dna.materials}
- layout: ${dna.layout}
- signature: ${dna.signature}

## Moodboard photos (inspiration only — never ship these)
Look at these to understand atmosphere. Do not use these URLs as \`<img>\` sources, CSS backgrounds, avatars, or hero images.
${photos.map((url) => `- ${url}`).join("\n") || "- none"}

## Anti-slop
Do not use decorative gradients, glow, glassmorphism, 3D blobs, icon grids, hairline rule decorations, or numbered 01/02/03 markers unless the content is actually a sequence.
Do not paste moodboard photography into the generated screens.
`;
}

export async function writeCollectionFiles(input: {
  name: string;
  prompt: string;
  moodboardTitle: string;
  dna: DesignDna;
}) {
  const slug = collectionSlug(input.name);
  const dir = collectionsDir();
  await mkdir(dir, { recursive: true });
  const guide = renderStyleGuide(input);
  await writeFile(path.join(dir, `${slug}.md`), guide, "utf8");
  await writeFile(
    path.join(dir, `${slug}.json`),
    JSON.stringify({ slug, ...input }, null, 2),
    "utf8",
  );
  return slug;
}

export async function removeCollectionFiles(name: string) {
  const slug = collectionSlug(name);
  const dir = collectionsDir();
  await Promise.all(
    [`${slug}.md`, `${slug}.json`].map(async (file) => {
      try {
        await unlink(path.join(dir, file));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }),
  );
  return slug;
}
