"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteCollectionButton } from "@/components/DeleteCollectionButton";
import { getOrCreateUserId } from "@/lib/user";
import type { SavedDesign } from "@/types/design";

export function CollectionList() {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getOrCreateUserId();
    fetch(`/api/designs?userId=${userId}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          designs?: SavedDesign[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load collection.");
        }
        setDesigns(payload.designs ?? []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load collection.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-[14px] text-mute">Loading collection…</p>;
  }

  if (error) {
    return <p className="text-center text-[14px] text-signal">{error}</p>;
  }

  if (!designs.length) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-[15px] text-mute">No saved designs yet.</p>
        <Link
          href="/"
          className="flex h-12 items-center bg-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-field"
        >
          Open studio
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid w-full gap-4 md:grid-cols-3">
      {designs.map((design) => {
        const photos = (design.dna.photos ?? []).slice(0, 3);
        const palette = design.dna.palette;
        return (
          <li key={design.id} className="flex h-full flex-col border border-ink bg-field">
            <Link
              href={`/collection/${design.id}`}
              className="flex flex-1 flex-col gap-4 p-4 text-left"
            >
              <div className="grid grid-cols-3 gap-1">
                {photos.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ))}
              </div>
              <div>
                <p className="font-display text-[18px] font-semibold tracking-[-0.03em]">
                  {design.name}
                </p>
                <p className="mt-1 text-[13px] text-mute">{design.moodboard_title}</p>
              </div>
              <p className="text-[12px] text-mute">
                {design.dna.font?.family ?? "Type"} ·{" "}
                {design.dna.buttons?.title ?? "Buttons"} ·{" "}
                {design.dna.textMotion?.title ?? "Motion"}
              </p>
              {palette ? (
                <div className="flex gap-1">
                  {[palette.accent, palette.ink, palette.mute, palette.field].map(
                    (color) => (
                      <span
                        key={color}
                        className="h-4 flex-1 border border-ink/10"
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </div>
              ) : null}
              <span className="font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
                View / edit
              </span>
            </Link>
            <div className="border-t border-ink p-4">
              <DeleteCollectionButton
                designId={design.id}
                onDeleted={() =>
                  setDesigns((current) => current.filter((item) => item.id !== design.id))
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
