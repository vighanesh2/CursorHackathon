"use client";

import type { CSSProperties } from "react";
import { BUTTON_SYSTEMS } from "@/lib/buttons";
import type { ButtonSystem, DesignPalette } from "@/types/design";

type ButtonGridProps = {
  palette: DesignPalette;
  fontFamily: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type SampleProps = {
  palette: DesignPalette;
  fontFamily: string;
  system: ButtonSystem;
};

function ButtonSamples({ palette, fontFamily, system }: SampleProps) {
  const type: CSSProperties = {
    fontFamily: `"${fontFamily}", sans-serif`,
    fontWeight: 500,
    fontSize: 13,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    lineHeight: 1,
  };

  const shell: CSSProperties = {
    ...type,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    padding: "0 20px",
    borderRadius: system.radius,
    borderStyle: "solid",
    borderWidth: system.borderWidth,
  };

  return (
    <div className="flex flex-col items-stretch gap-3">
      <span
        className="text-center"
        style={{
          ...shell,
          backgroundColor: palette.accent,
          borderColor: palette.accent,
          color: palette.field,
        }}
      >
        Primary
      </span>
      <span
        className="text-center"
        style={{
          ...shell,
          backgroundColor: "transparent",
          borderColor: palette.ink,
          color: palette.ink,
        }}
      >
        Secondary
      </span>
      <span
        className="text-center"
        style={{
          ...shell,
          backgroundColor: "transparent",
          borderColor: "transparent",
          borderWidth: 0,
          color: palette.mute,
          textDecoration: "underline",
          textUnderlineOffset: 4,
        }}
      >
        Tertiary
      </span>
    </div>
  );
}

export function ButtonGrid({
  palette,
  fontFamily,
  selectedId,
  onSelect,
}: ButtonGridProps) {
  return (
    <ul className="grid w-full gap-4 md:grid-cols-3">
      {BUTTON_SYSTEMS.map((system) => {
        const selected = system.id === selectedId;
        return (
          <li key={system.id}>
            <button
              type="button"
              onClick={() => onSelect(system.id)}
              aria-pressed={selected}
              className={`flex h-full w-full flex-col gap-6 bg-field p-5 text-left ${
                selected
                  ? "border border-signal outline outline-2 outline-offset-2 outline-signal"
                  : "border border-ink"
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                {system.title}
              </p>
              <ButtonSamples
                palette={palette}
                fontFamily={fontFamily}
                system={system}
              />
              <p className="text-[13px] leading-5 text-mute">{system.thesis}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
