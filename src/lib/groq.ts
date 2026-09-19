import Groq from "groq-sdk";
import type { DesignDna, MoodboardSession } from "@/types/design";

const MODEL = "openai/gpt-oss-120b";

export type GroqMoodboard = {
  title: string;
  thesis: string;
  tiles: string[];
  dna: DesignDna;
};

type GroqPayload = {
  name: string;
  moodboards: GroqMoodboard[];
};

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }
  return new Groq({ apiKey });
}

function parseJson(text: string): GroqPayload {
  return parseObject(text) as GroqPayload;
}

function parseObject(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Groq returned incomplete JSON.");
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

function sanitizeTile(query: string) {
  const banned =
    /gradient|\bicon\b|\blogo\b|mockup|\bui\b|website|dashboard|glassmorphism|neon|\bblob\b|3d render|\binter\b|poppins|roboto|geist/i;
  if (!query || banned.test(query)) return "";
  return query;
}

function normalize(payload: GroqPayload): GroqPayload {
  const moodboards = payload.moodboards ?? (payload as { boards?: GroqMoodboard[] }).boards;
  return {
    name: typeof payload.name === "string" ? payload.name.trim() : "",
    moodboards: Array.isArray(moodboards)
      ? moodboards.filter(Boolean).map((board) => ({
          ...board,
          tiles: Array.isArray(board.tiles)
            ? board.tiles.map(sanitizeTile).filter(Boolean)
            : [],
        }))
      : [],
  };
}

async function requestBrief(prompt: string): Promise<GroqPayload> {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.75,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a design director building Pinterest-style photographic moodboards of the real world, not AI UI.
Return JSON only:
{
  "name": "short project name, 1-3 words",
  "moodboards": [
    {
      "title": "2-4 word direction name",
      "thesis": "one sentence visual thesis",
      "tiles": ["eight short photo search phrases"],
      "dna": {
        "palette": {
          "canvas": "#hex",
          "ink": "#hex",
          "accent": "#hex",
          "mute": "#hex",
          "field": "#hex"
        },
        "type": { "display": "specific typeface", "body": "specific typeface", "utility": "specific typeface" },
        "layout": "one sentence grounded in the subject's rooms and objects",
        "signature": "one memorable craft detail, not a generic UI widget",
        "materials": "materials and lighting in these photos",
        "motion": "physical motion of this world, not UI animation tropes"
      }
    }
  ]
}

Rules:
- Exactly 3 moodboards, each a different studio.
- tiles: exactly 8 camera subjects from that world: people, rooms, tools, food, cloth, vehicles, print, weather. Examples: "red cherries in water", "vintage thunderbird chrome", "black hat red gloves", "coupe cocktail night".
- Ban from tiles and DNA: gradients, glow, glassmorphism, 3D blobs, icons, icon grids, logos, mockups, website UI, app screens, dashboards, hairline rules, numbered 01 markers, Inter, Roboto, Arial, Geist, Poppins, Montserrat, Plus Jakarta Sans, Space Grotesk, Comic Sans, Orbitron.
- Do not describe abstract color fields, neon cyber grids, or decorative rules.
- Palette must be flat sampled colors from the photos, never a gradient recipe.
- Typefaces must be distinctive and specific to the subject (foundry names welcome).
- Design DNA describes the same world the photos show.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Groq returned an empty design brief.");
  }

  return normalize(parseJson(text));
}

export async function generateMoodboardBrief(
  prompt: string,
): Promise<Omit<MoodboardSession, "moodboards"> & { moodboards: GroqMoodboard[] }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const payload = await requestBrief(prompt);
      if (payload.name && payload.moodboards.length >= 3) {
        return {
          name: payload.name,
          prompt,
          moodboards: payload.moodboards.slice(0, 3),
        };
      }
      lastError = new Error("Groq returned an incomplete design brief.");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Groq request failed.");
    }
  }

  throw lastError ?? new Error("Groq returned an incomplete design brief.");
}

type GroqFontChoice = {
  family: string;
  thesis: string;
  sampleHeadline: string;
  sampleBody: string;
};

export async function generateFontBrief(input: {
  prompt: string;
  name: string;
  moodboardTitle: string;
  thesis: string;
  materials: string;
  catalog: string[];
}): Promise<GroqFontChoice[]> {
  const groq = getGroq();
  const catalog = input.catalog.join(", ");

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Pick 3 Google Font families that belong to this company's visual world.
Return JSON only:
{
  "fonts": [
    {
      "family": "Exact Google Font name from the list",
      "thesis": "one sentence why this family fits",
      "sampleHeadline": "short headline in this company's voice",
      "sampleBody": "two sentences of real-sounding copy for this company"
    }
  ]
}

Rules:
- Exactly 3 fonts.
- family MUST be copied exactly from this list: ${catalog}
- Each family must feel different (one display/serif, one workhorse, one contrast).
- Never pick Inter, Roboto, Arial, Geist, Poppins, Montserrat, Plus Jakarta Sans, Space Grotesk.
- Sample copy is about the company, not lorem ipsum.`,
      },
      {
        role: "user",
        content: `Company: ${input.name}
Brief: ${input.prompt}
Moodboard: ${input.moodboardTitle}
Thesis: ${input.thesis}
Materials: ${input.materials}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Groq returned empty font choices.");
  }

  const payload = parseObject(text) as { fonts?: GroqFontChoice[] };
  const fonts = Array.isArray(payload.fonts) ? payload.fonts : [];
  if (fonts.length < 3) {
    throw new Error("Groq returned incomplete font choices.");
  }
  return fonts.slice(0, 3);
}

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function chatReply(messages: ChatTurn[]) {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: 0.6,
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content:
          "You are a short, useful assistant on a You-i test page. Answer in a few sentences. No markdown headings.",
      },
      ...messages,
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty reply.");
  }
  return text;
}
