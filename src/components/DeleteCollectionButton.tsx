"use client";

import { useEffect, useState } from "react";
import { getOrCreateUserId } from "@/lib/user";

type Stage = 0 | 1 | 2;

const LABELS: Record<Stage, string> = {
  0: "Delete",
  1: "Delete this collection?",
  2: "Really delete? Cannot undo",
};

export function DeleteCollectionButton({
  designId,
  onDeleted,
}: {
  designId: string;
  onDeleted: () => void;
}) {
  const [stage, setStage] = useState<Stage>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stage === 0) return;
    const timer = window.setTimeout(() => setStage(0), 6000);
    return () => window.clearTimeout(timer);
  }, [stage]);

  async function onClick() {
    if (busy) return;
    setError(null);

    if (stage < 2) {
      setStage((stage + 1) as Stage);
      return;
    }

    setBusy(true);
    try {
      const userId = getOrCreateUserId();
      const response = await fetch(`/api/designs/${designId}?userId=${userId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not delete collection.");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete collection.");
      setStage(0);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={`h-11 px-4 font-display text-[12px] font-semibold uppercase tracking-[0.14em] disabled:bg-line disabled:text-mute ${
          stage === 0
            ? "border border-ink bg-field text-ink"
            : "bg-signal text-signal-ink"
        }`}
      >
        {busy ? "Deleting" : LABELS[stage]}
      </button>
      {error ? <p className="text-[12px] text-signal">{error}</p> : null}
    </div>
  );
}
