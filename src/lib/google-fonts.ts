export const GOOGLE_FONT_CATALOG = [
  { family: "Fraunces", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Newsreader", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Instrument Serif", weights: [400], italic: true },
  { family: "Instrument Sans", weights: [400, 500, 600, 700], italic: true },
  { family: "Cormorant Garamond", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "EB Garamond", weights: [400, 500, 600, 700], italic: true },
  { family: "Libre Baskerville", weights: [400, 700], italic: true },
  { family: "Spectral", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Cardo", weights: [400, 700], italic: true },
  { family: "Young Serif", weights: [400], italic: false },
  { family: "Literata", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Source Serif 4", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Baskervville", weights: [400], italic: true },
  { family: "Bodoni Moda", weights: [400, 500, 600, 700], italic: true },
  { family: "Libre Caslon Text", weights: [400, 700], italic: true },
  { family: "Bricolage Grotesque", weights: [300, 400, 500, 600, 700], italic: false },
  { family: "Syne", weights: [400, 500, 600, 700, 800], italic: false },
  { family: "Figtree", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Outfit", weights: [300, 400, 500, 600, 700], italic: false },
  { family: "Manrope", weights: [300, 400, 500, 600, 700], italic: false },
  { family: "IBM Plex Sans", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "IBM Plex Serif", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Schibsted Grotesk", weights: [400, 500, 600, 700], italic: true },
  { family: "Red Hat Display", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Red Hat Text", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Big Shoulders Display", weights: [300, 400, 500, 600, 700], italic: false },
  { family: "Archivo", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Karla", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Source Sans 3", weights: [300, 400, 500, 600, 700], italic: true },
  { family: "Atkinson Hyperlegible", weights: [400, 700], italic: true },
  { family: "Lora", weights: [400, 500, 600, 700], italic: true },
  { family: "Petrona", weights: [300, 400, 500, 600, 700], italic: true },
] as const;

export type CatalogFont = (typeof GOOGLE_FONT_CATALOG)[number];

export function googleFontCssUrl(font: CatalogFont) {
  const family = font.family.replace(/ /g, "+");
  if (font.italic) {
    const pairs = [
      ...font.weights.map((weight) => `0,${weight}`),
      ...font.weights.map((weight) => `1,${weight}`),
    ].join(";");
    return `https://fonts.googleapis.com/css2?family=${family}:ital,wght@${pairs}&display=swap`;
  }

  return `https://fonts.googleapis.com/css2?family=${family}:wght@${font.weights.join(";")}&display=swap`;
}

export function findCatalogFont(family: string) {
  const needle = family.trim().toLowerCase();
  return GOOGLE_FONT_CATALOG.find((font) => font.family.toLowerCase() === needle);
}

export function catalogNames() {
  return GOOGLE_FONT_CATALOG.map((font) => font.family);
}
