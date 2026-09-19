---
name: you-i
description: Loads a You-i Design DNA collection and applies it when building UI. Use when the user mentions @you-i, a collection name such as dashboard-app, design inspiration, moodboard, or asks to design a website or interface from a You-i collection.
---

# You-i

## When this applies

The user wants Cursor to build UI from a saved You-i collection, for example:

`@you-i dashboard-app use this design inspiration to design the website`

## Steps

1. Call the `you-i` MCP tool `get_collection` with the collection name or slug from the prompt.
2. If the name is unclear, call `list_collections` first.
3. If MCP is unavailable or returns no user token, tell them to paste the Connect Cursor token from the You-i Collection page into the plugin settings.
4. Build the requested UI using only that Design DNA: palette, Google Font, button radii, text motion, materials, and layout language.
5. Moodboard / reference photos are **inspiration only**. Never put those images (or their URLs) in the generated UI: no `<img>`, CSS `background-image`, collage, hero photo, avatar, or Openverse/thumb assets from the collection. Translate lighting, materials, and color into CSS and type instead. If the product needs pictures, invent or fetch new ones that fit the brief — do not reuse the moodboard files.
6. Do not introduce AI-slop defaults (decorative gradients, glow, glass, icon grids, Inter/Poppins/Geist).

## Output

Implement the UI in the current project. Keep the collection's materials, type, and color intact. Ship a real interface, not a moodboard.
