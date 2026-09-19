"use client";

import { useEffect } from "react";
import type { FontOption } from "@/types/design";

const WEIGHT_NAMES: Record<number, string> = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extrabold",
};

type FontGridProps = {
  fonts: FontOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function FontGrid({ fonts, selectedId, onSelect }: FontGridProps) {
  useEffect(() => {
    for (const font of fonts) {
      const id = `gf-${font.family.replace(/\s+/g, "-")}`;
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = font.cssUrl;
      document.head.appendChild(link);
    }
  }, [fonts]);

  return (
    <ul className="grid w-full gap-4 md:grid-cols-3">
      {fonts.map((font) => {
        const selected = font.id === selectedId;
        return (
          <li key={font.id}>
            <button
              type="button"
              onClick={() => onSelect(font.id)}
              aria-pressed={selected}
              className={`flex h-full w-full flex-col gap-5 border bg-field p-5 text-left ${
                selected
                  ? "border-signal outline outline-2 outline-offset-2 outline-signal"
                  : "border-ink"
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                {font.family}
              </p>
              <p
                className="text-[34px] leading-10 tracking-[-0.03em] text-ink"
                style={{ fontFamily: `"${font.family}", serif`, fontWeight: 500 }}
              >
                {font.sampleHeadline}
              </p>
              <p
                className="text-[15px] leading-6 text-ink"
                style={{ fontFamily: `"${font.family}", serif`, fontWeight: 400 }}
              >
                {font.sampleBody}
              </p>
              <div
                className="flex flex-col gap-2 pt-1 text-ink"
                style={{ fontFamily: `"${font.family}", serif` }}
              >
                {font.weights.map((weight) => (
                  <p key={weight} className="text-[15px] leading-5" style={{ fontWeight: weight }}>
                    {WEIGHT_NAMES[weight] ?? weight} · ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </p>
                ))}
                {font.italic ? (
                  <p className="text-[15px] leading-5" style={{ fontStyle: "italic", fontWeight: 400 }}>
                    Italic · abcdefghijklmnopqrstuvwxyz 0123456789
                  </p>
                ) : null}
              </div>
              <p className="text-[13px] leading-5 text-mute">{font.thesis}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
