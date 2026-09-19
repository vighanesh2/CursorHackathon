"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimationGrid } from "@/components/AnimationGrid";
import { DeleteCollectionButton } from "@/components/DeleteCollectionButton";
import { ButtonGrid } from "@/components/ButtonGrid";
import { BUTTON_SYSTEMS } from "@/lib/buttons";
import { TEXT_MOTIONS } from "@/lib/text-motion";
import { getOrCreateUserId, saveProjectName } from "@/lib/user";
import type { DesignDna, SavedDesign } from "@/types/design";

export function DesignEditor({ id }: { id: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [design, setDesign] = useState<SavedDesign | null>(null);
  const [name, setName] = useState("");
  const [dna, setDna] = useState<DesignDna | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextUserId = getOrCreateUserId();
    setUserId(nextUserId);
    fetch(`/api/designs/${id}?userId=${nextUserId}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          design?: SavedDesign;
          error?: string;
        };
        if (!response.ok || !payload.design) {
          throw new Error(payload.error ?? "Design not found.");
        }
        setDesign(payload.design);
        setName(payload.design.name);
        setDna(payload.design.dna);
        if (payload.design.dna.font?.cssUrl) {
          const linkId = `gf-edit-${payload.design.dna.font.family.replace(/\s+/g, "-")}`;
          if (!document.getElementById(linkId)) {
            const link = document.createElement("link");
            link.id = linkId;
            link.rel = "stylesheet";
            link.href = payload.design.dna.font.cssUrl;
            document.head.appendChild(link);
          }
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load design.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    if (!userId || !dna || !name.trim()) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch(`/api/designs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: name.trim(), dna }),
      });
      const payload = (await response.json()) as { error?: string; name?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update design.");
      }
      saveProjectName(payload.name ?? name.trim());
      setStatus("Saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update design.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-center text-[14px] text-mute">Loading design…</p>;
  }

  if (!design || !dna) {
    return <p className="text-center text-[14px] text-signal">{error ?? "Design not found."}</p>;
  }

  const fontFamily = dna.font?.family ?? "serif";

  return (
    <div className="flex w-full flex-col gap-8">
      <label className="flex w-full flex-col gap-2">
        <span className="font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
          Name
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-12 border border-ink bg-field px-4 text-[17px] text-ink outline-none"
        />
      </label>

      <p className="text-[14px] text-mute">{design.prompt}</p>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[16px] font-semibold">Buttons</h2>
        <ButtonGrid
          palette={dna.palette}
          fontFamily={fontFamily}
          selectedId={dna.buttons?.id ?? null}
          onSelect={(buttonId) => {
            const next = BUTTON_SYSTEMS.find((system) => system.id === buttonId);
            if (!next) return;
            setDna({ ...dna, buttons: next });
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[16px] font-semibold">Motion</h2>
        <AnimationGrid
          sample={name || design.name}
          fontFamily={fontFamily}
          palette={dna.palette}
          selectedId={dna.textMotion?.id ?? null}
          onSelect={(motionId) => {
            const chosen = TEXT_MOTIONS.find((item) => item.id === motionId);
            if (!chosen) return;
            setDna({
              ...dna,
              textMotion: chosen,
              motion: chosen.thesis,
            });
          }}
        />
      </section>

      <div className="flex w-full max-w-md flex-col items-stretch gap-3 self-center">
        <button
          type="button"
          onClick={save}
          disabled={saving || !name.trim()}
          className="h-12 bg-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-field disabled:bg-line disabled:text-mute"
        >
          {saving ? "Saving" : "Save changes"}
        </button>
        <DeleteCollectionButton
          designId={id}
          onDeleted={() => router.push("/collection")}
        />
      </div>
      {error ? <p className="text-center text-[14px] text-signal">{error}</p> : null}
      {status && !error ? (
        <p className="text-center text-[14px] text-mute">{status}</p>
      ) : null}
    </div>
  );
}
