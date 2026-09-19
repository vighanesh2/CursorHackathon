"use client";

import type { Moodboard } from "@/types/design";

type MoodboardGridProps = {
  moodboards: Moodboard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function TilePhoto({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return <span className="block h-full w-full rounded-2xl bg-line" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-full w-full rounded-2xl object-cover" />
  );
}

export function MoodboardGrid({
  moodboards,
  selectedId,
  onSelect,
}: MoodboardGridProps) {
  return (
    <ul className="grid w-full gap-4 md:grid-cols-3">
      {moodboards.map((board) => {
        const selected = board.id === selectedId;
        const photos = board.tiles;
        const palette = board.dna.palette;
        const swatches = [
          palette.accent,
          palette.mute,
          palette.ink,
          palette.field,
        ];

        return (
          <li key={board.id}>
            <button
              type="button"
              onClick={() => onSelect(board.id)}
              aria-pressed={selected}
              className={`w-full overflow-hidden rounded-[4px] border p-3 text-left ${
                selected
                  ? "border-signal outline outline-2 outline-offset-2 outline-signal"
                  : "border-ink"
              }`}
              style={{ backgroundColor: palette.canvas }}
            >
              <div className="grid grid-cols-3 grid-rows-3 gap-2">
                <div className="aspect-square">
                  <TilePhoto src={photos[0]?.imageUrl ?? ""} alt={photos[0]?.query ?? ""} />
                </div>
                <div className="aspect-square">
                  <TilePhoto src={photos[1]?.imageUrl ?? ""} alt={photos[1]?.query ?? ""} />
                </div>
                <div className="aspect-square">
                  <TilePhoto src={photos[2]?.imageUrl ?? ""} alt={photos[2]?.query ?? ""} />
                </div>
                <div className="aspect-square">
                  <TilePhoto src={photos[3]?.imageUrl ?? ""} alt={photos[3]?.query ?? ""} />
                </div>
                <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-2">
                  {swatches.map((color) => (
                    <span
                      key={color}
                      className="rounded-2xl"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="aspect-square">
                  <TilePhoto src={photos[4]?.imageUrl ?? ""} alt={photos[4]?.query ?? ""} />
                </div>
                <div className="aspect-square">
                  <TilePhoto src={photos[5]?.imageUrl ?? ""} alt={photos[5]?.query ?? ""} />
                </div>
                <div className="aspect-square">
                  <TilePhoto src={photos[6]?.imageUrl ?? ""} alt={photos[6]?.query ?? ""} />
                </div>
                <div className="aspect-square">
                  <TilePhoto src={photos[7]?.imageUrl ?? ""} alt={photos[7]?.query ?? ""} />
                </div>
              </div>
              <span className="mt-3 block font-display text-[15px] font-semibold tracking-[-0.02em]" style={{ color: palette.ink }}>
                {board.title}
              </span>
              <span className="mt-1 block text-[13px] leading-5" style={{ color: palette.mute }}>
                {board.thesis}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
