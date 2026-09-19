"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimationGrid } from "@/components/AnimationGrid";
import { ButtonGrid } from "@/components/ButtonGrid";
import { FontGrid } from "@/components/FontGrid";
import { MoodboardGrid } from "@/components/MoodboardGrid";
import { PromptBar } from "@/components/PromptBar";
import { BUTTON_SYSTEMS } from "@/lib/buttons";
import { TEXT_MOTIONS } from "@/lib/text-motion";
import {
  getOrCreateUserId,
  getSavedProjectName,
  rememberDraft,
  saveProjectName,
} from "@/lib/user";
import type {
  DesignDraft,
  FontOption,
  Moodboard,
  MoodboardSession,
} from "@/types/design";

type Step = "moodboard" | "fonts" | "buttons" | "motion";

export function Studio() {
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("moodboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [session, setSession] = useState<MoodboardSession | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DesignDraft | null>(null);
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [selectedFontId, setSelectedFontId] = useState<string | null>(null);
  const [selectedButtonId, setSelectedButtonId] = useState<string | null>(null);
  const [selectedMotionId, setSelectedMotionId] = useState<string | null>(null);
  const [designName, setDesignName] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUserId(getOrCreateUserId());
    setProjectName(getSavedProjectName());
  }, []);

  const selected: Moodboard | undefined = session?.moodboards.find(
    (board) => board.id === selectedId,
  );
  const selectedFont = fonts.find((font) => font.id === selectedFontId);
  const selectedButton = BUTTON_SYSTEMS.find((system) => system.id === selectedButtonId);
  const hasMoodboards = Boolean(session?.moodboards.length);
  const onMoodboards = step === "moodboard";
  const onFonts = step === "fonts";
  const onButtons = step === "buttons";
  const onMotion = step === "motion";
  const pastBrief = onFonts || onButtons || onMotion;

  function persist(next: DesignDraft) {
    setDraft(next);
    rememberDraft(next);
  }

  async function generate(prompt: string) {
    setLoading(true);
    setError(null);
    setStatus(null);
    setSelectedId(null);
    setStep("moodboard");
    setFonts([]);
    setSelectedFontId(null);
    setSelectedButtonId(null);
    setSelectedMotionId(null);
    setDraft(null);

    try {
      const response = await fetch("/api/moodboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const payload = (await response.json()) as MoodboardSession & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not generate moodboards.");
      }

      setSession(payload);
      setStatus("Pick a board, then continue.");
    } catch (err) {
      setSession(null);
      setError(err instanceof Error ? err.message : "Could not generate moodboards.");
    } finally {
      setLoading(false);
    }
  }

  async function goToFonts() {
    if (!userId || !session || !selected) return;

    setLoading(true);
    setError(null);
    setStatus(null);

    const nextDraft: DesignDraft = {
      userId,
      name: projectName ?? session.name,
      prompt: session.prompt,
      moodboard: selected,
    };
    persist(nextDraft);

    try {
      const response = await fetch("/api/fonts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: session.prompt,
          name: nextDraft.name,
          moodboardTitle: selected.title,
          thesis: selected.thesis,
          materials: selected.dna.materials,
        }),
      });
      const payload = (await response.json()) as { fonts?: FontOption[]; error?: string };
      if (!response.ok || !payload.fonts) {
        throw new Error(payload.error ?? "Could not load fonts.");
      }

      setFonts(payload.fonts);
      setStep("fonts");
      persist({ ...nextDraft, fonts: payload.fonts });
      setStatus("Pick a type family, then continue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load fonts.");
    } finally {
      setLoading(false);
    }
  }

  function selectFont(id: string) {
    setSelectedFontId(id);
    if (!draft) return;
    persist({ ...draft, selectedFontId: id });
  }

  function goToButtons() {
    if (!draft || !selectedFont) return;

    const moodboard = {
      ...draft.moodboard,
      dna: {
        ...draft.moodboard.dna,
        type: {
          display: selectedFont.family,
          body: selectedFont.family,
          utility: selectedFont.family,
        },
        font: {
          family: selectedFont.family,
          cssUrl: selectedFont.cssUrl,
          weights: selectedFont.weights,
          italic: selectedFont.italic,
        },
      },
    };

    const next: DesignDraft = {
      ...draft,
      moodboard,
      selectedFontId: selectedFont.id,
      fonts,
      buttons: BUTTON_SYSTEMS,
    };
    persist(next);
    setSelectedButtonId(null);
    setStep("buttons");
    setStatus("Pick a button language. Still not saved.");
  }

  function selectButton(id: string) {
    setSelectedButtonId(id);
    if (!draft) return;
    persist({ ...draft, selectedButtonId: id });
  }

  function goToMotion() {
    if (!draft || !selectedButton) return;

    const moodboard = {
      ...draft.moodboard,
      dna: {
        ...draft.moodboard.dna,
        buttons: selectedButton,
      },
    };

    const next: DesignDraft = {
      ...draft,
      moodboard,
      selectedButtonId: selectedButton.id,
      buttons: BUTTON_SYSTEMS,
      motions: TEXT_MOTIONS,
    };
    persist(next);
    setSelectedMotionId(null);
    setDesignName(next.name);
    setStep("motion");
    setStatus("Pick a text motion, name it, then save.");
  }

  function selectMotion(id: string) {
    setSelectedMotionId(id);
    if (!draft) return;
    const motion = TEXT_MOTIONS.find((item) => item.id === id);
    persist({
      ...draft,
      name: designName.trim() || draft.name,
      selectedMotionId: id,
      moodboard: motion
        ? {
            ...draft.moodboard,
            dna: {
              ...draft.moodboard.dna,
              textMotion: motion,
              motion: motion.thesis,
            },
          }
        : draft.moodboard,
    });
  }

  async function saveDesign() {
    if (!userId || !draft || !selectedMotionId) return;
    const name = designName.trim();
    if (!name) return;

    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          prompt: draft.prompt,
          moodboardTitle: draft.moodboard.title,
          moodboardImageUrl:
            draft.moodboard.tiles.find((tile) => tile.imageUrl)?.imageUrl ?? "",
          dna: {
            ...draft.moodboard.dna,
            photos: draft.moodboard.dna.photos ??
              draft.moodboard.tiles.map((tile) => tile.imageUrl).filter(Boolean),
          },
        }),
      });
      const payload = (await response.json()) as { error?: string; name?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save design DNA.");
      }

      saveProjectName(payload.name ?? name);
      persist({ ...draft, name: payload.name ?? name });
      setStatus("Saved. Opening collection…");
      router.push("/collection");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save design DNA.");
    } finally {
      setSaving(false);
    }
  }

  const heading = onMotion
    ? "Choose motion"
    : onButtons
      ? "Choose buttons"
      : onFonts
        ? "Choose a family"
        : hasMoodboards
          ? session?.name
          : "Unslop this UI";

  const blurb = onMotion
    ? "Pick a motion, name the design, then save it to your collection."
    : onButtons
      ? "Primary, secondary, and tertiary in the moodboard colors, set in the family you picked."
      : onFonts
        ? "Three Google Font families for the board you picked. Each card shows the full family."
        : "Describe the company or site. Pick a moodboard, then choose type.";

  return (
    <div
      className={`flex flex-1 px-6 ${hasMoodboards || pastBrief ? "items-start py-12" : "items-center"}`}
    >
      <main className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-display text-[13px] font-semibold uppercase tracking-[0.28em] text-mute">
            You-i
          </p>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.03em] text-ink">
            {heading}
          </h1>
          <p className="max-w-xl text-[15px] leading-6 text-mute">{blurb}</p>
        </div>

        {onMoodboards ? (
          <PromptBar
            query={query}
            loading={loading}
            onQueryChange={setQuery}
            onSubmit={generate}
          />
        ) : null}

        {loading ? (
          <ul className="grid w-full gap-4 md:grid-cols-3">
            {[0, 1, 2].map((slot) => (
              <li
                key={slot}
                className="min-h-80 animate-pulse rounded-[4px] border border-line bg-field"
              />
            ))}
          </ul>
        ) : null}

        {session && !loading && onMoodboards ? (
          <>
            <MoodboardGrid
              moodboards={session.moodboards}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <button
              type="button"
              onClick={goToFonts}
              disabled={!selected}
              className="h-12 min-w-[180px] bg-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-field disabled:cursor-not-allowed disabled:bg-line disabled:text-mute"
            >
              Next
            </button>
          </>
        ) : null}

        {onFonts && !loading ? (
          <>
            <FontGrid
              fonts={fonts}
              selectedId={selectedFontId}
              onSelect={selectFont}
            />
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("moodboard");
                  setStatus("Pick a board, then continue.");
                }}
                className="h-12 min-w-[180px] border border-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToButtons}
                disabled={!selectedFont}
                className="h-12 min-w-[180px] bg-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-field disabled:cursor-not-allowed disabled:bg-line disabled:text-mute"
              >
                Next
              </button>
            </div>
          </>
        ) : null}

        {onButtons && !loading && draft ? (
          <>
            <ButtonGrid
              palette={draft.moodboard.dna.palette}
              fontFamily={draft.moodboard.dna.font?.family ?? selectedFont?.family ?? "sans-serif"}
              selectedId={selectedButtonId}
              onSelect={selectButton}
            />
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("fonts");
                  setStatus("Pick a type family, then continue.");
                }}
                className="h-12 min-w-[180px] border border-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToMotion}
                disabled={!selectedButton}
                className="h-12 min-w-[180px] bg-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-field disabled:cursor-not-allowed disabled:bg-line disabled:text-mute"
              >
                Next
              </button>
            </div>
          </>
        ) : null}

        {onMotion && !loading && draft ? (
          <>
            <AnimationGrid
              sample={draft.name}
              fontFamily={
                draft.moodboard.dna.font?.family ?? selectedFont?.family ?? "serif"
              }
              palette={draft.moodboard.dna.palette}
              selectedId={selectedMotionId}
              onSelect={selectMotion}
            />
            <div className="flex w-full max-w-[720px] flex-col gap-3">
              <label htmlFor="design-name" className="font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
                Name
              </label>
              <input
                id="design-name"
                value={designName}
                onChange={(event) => setDesignName(event.target.value)}
                placeholder="Name this design"
                className="h-12 border border-ink bg-field px-4 text-[17px] text-ink outline-none"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("buttons");
                  setStatus("Pick a button language. Still not saved.");
                }}
                className="h-12 min-w-[180px] border border-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink"
              >
                Back
              </button>
              <button
                type="button"
                onClick={saveDesign}
                disabled={!selectedMotionId || !designName.trim() || saving}
                className="h-12 min-w-[180px] bg-ink px-6 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-field disabled:cursor-not-allowed disabled:bg-line disabled:text-mute"
              >
                {saving ? "Saving" : "Save"}
              </button>
            </div>
          </>
        ) : null}

        {error ? <p className="text-center text-[14px] text-signal">{error}</p> : null}
        {status && !error ? (
          <p className="text-center text-[14px] text-mute">{status}</p>
        ) : null}

        {userId ? (
          <p className="font-mono text-[11px] tracking-wide text-mute">
            session {userId.slice(0, 8)}
            {draft?.moodboard.title ? ` · ${draft.moodboard.title}` : ""}
            {selectedFont ? ` · ${selectedFont.family}` : ""}
            {selectedButton ? ` · ${selectedButton.title}` : ""}
            {selectedMotionId
              ? ` · ${TEXT_MOTIONS.find((motion) => motion.id === selectedMotionId)?.title ?? ""}`
              : ""}
          </p>
        ) : null}
      </main>
    </div>
  );
}
