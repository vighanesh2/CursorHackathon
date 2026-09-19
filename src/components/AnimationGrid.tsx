"use client";

import { TEXT_MOTIONS } from "@/lib/text-motion";
import type { DesignPalette } from "@/types/design";

type AnimationGridProps = {
  sample: string;
  fontFamily: string;
  palette: DesignPalette;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function PressSample({ text, fontFamily }: { text: string; fontFamily: string }) {
  return (
    <p
      className="flex flex-wrap justify-center text-[28px] leading-tight tracking-[-0.03em]"
      style={{ fontFamily: `"${fontFamily}", serif` }}
    >
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="youi-press inline-block"
          style={{ animationDelay: `${index * 45}ms` }}
        >
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </p>
  );
}

function RiseSample({ text, fontFamily }: { text: string; fontFamily: string }) {
  return (
    <div className="overflow-hidden">
      <p
        className="youi-rise text-center text-[28px] leading-tight tracking-[-0.03em]"
        style={{ fontFamily: `"${fontFamily}", serif` }}
      >
        {text}
      </p>
    </div>
  );
}

function RuleSample({
  text,
  fontFamily,
  accent,
}: {
  text: string;
  fontFamily: string;
  accent: string;
}) {
  return (
    <div className="inline-flex flex-col items-center">
      <p
        className="text-center text-[28px] leading-tight tracking-[-0.03em]"
        style={{ fontFamily: `"${fontFamily}", serif` }}
      >
        {text}
      </p>
      <span className="youi-rule mt-2 h-px w-full origin-left" style={{ backgroundColor: accent }} />
    </div>
  );
}

export function AnimationGrid({
  sample,
  fontFamily,
  palette,
  selectedId,
  onSelect,
}: AnimationGridProps) {
  return (
    <ul className="grid w-full gap-4 md:grid-cols-3">
      {TEXT_MOTIONS.map((motion) => {
        const selected = motion.id === selectedId;
        return (
          <li key={motion.id}>
            <button
              type="button"
              onClick={() => onSelect(motion.id)}
              aria-pressed={selected}
              className={`flex h-full min-h-72 w-full flex-col gap-6 bg-field p-5 text-left ${
                selected
                  ? "border border-signal outline outline-2 outline-offset-2 outline-signal"
                  : "border border-ink"
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                {motion.title}
              </p>
              <div
                className="flex flex-1 items-center justify-center px-2"
                style={{ color: palette.ink }}
              >
                {motion.id === "press" ? (
                  <PressSample text={sample} fontFamily={fontFamily} />
                ) : null}
                {motion.id === "rise" ? (
                  <RiseSample text={sample} fontFamily={fontFamily} />
                ) : null}
                {motion.id === "rule" ? (
                  <RuleSample
                    text={sample}
                    fontFamily={fontFamily}
                    accent={palette.accent}
                  />
                ) : null}
              </div>
              <p className="text-[13px] leading-5 text-mute">{motion.thesis}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
