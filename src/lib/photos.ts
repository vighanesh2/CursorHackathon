const OPENVERSE = "https://api.openverse.org/v1/images/";

const SLOP =
  /icon|logo|svg|clipart|illustration|ui kit|mockup|gradient|3d render|futuristic|neon glow|glassmorphism|app screenshot|interface/i;

type OpenverseResult = {
  title?: string;
  url?: string;
  thumbnail?: string;
  tags?: Array<{ name?: string } | string>;
};

type OpenverseResponse = {
  results?: OpenverseResult[];
};

function tagText(tags: OpenverseResult["tags"]) {
  if (!tags) return "";
  return tags
    .map((tag) => (typeof tag === "string" ? tag : tag.name ?? ""))
    .join(" ");
}

function isPhotographic(item: OpenverseResult) {
  const blob = `${item.title ?? ""} ${tagText(item.tags)} ${item.url ?? ""}`;
  if (SLOP.test(blob)) return false;
  if (item.url?.toLowerCase().endsWith(".svg")) return false;
  return Boolean(item.thumbnail || item.url);
}

async function searchOnce(query: string): Promise<string | null> {
  const url = `${OPENVERSE}?${new URLSearchParams({
    q: query,
    page_size: "20",
    mature: "false",
    category: "photograph",
    extension: "jpg",
  }).toString()}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "You-i/0.1 (design moodboard tool)",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as OpenverseResponse;
  const hit = payload.results?.find(isPhotographic);
  return hit?.thumbnail || hit?.url || null;
}

export async function findPhoto(query: string, fallbackQuery: string) {
  const direct = await searchOnce(query);
  if (direct) return direct;

  const words = query.split(/[,\s]+/).filter(Boolean).slice(0, 2).join(" ");
  if (words && words !== query) {
    const narrowed = await searchOnce(words);
    if (narrowed) return narrowed;
  }

  return searchOnce(fallbackQuery);
}
