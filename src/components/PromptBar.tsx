"use client";

import { FormEvent } from "react";

type PromptBarProps = {
  query: string;
  loading?: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export function PromptBar({
  query,
  loading = false,
  onQueryChange,
  onSubmit,
}: PromptBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value || loading) return;
    onSubmit(value);
  }

  const canSend = query.trim().length > 0 && !loading;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[720px]">
      <label htmlFor="you-i-prompt" className="sr-only">
        Describe the company or website
      </label>
      <div className="prompt-shell flex h-16 overflow-hidden rounded-[4px] border border-ink bg-field">
        <input
          id="you-i-prompt"
          type="text"
          name="prompt"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="A coastal bakery, a freight software firm, a jazz club…"
          autoComplete="off"
          disabled={loading}
          className="min-w-0 flex-1 bg-transparent px-5 text-[17px] text-ink outline-none placeholder:text-mute disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="flex h-full min-w-[92px] items-center justify-center gap-2 bg-signal px-4 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-signal-ink sm:min-w-[108px] sm:px-5 sm:text-[13px] disabled:cursor-not-allowed disabled:bg-line disabled:text-mute"
        >
          {loading ? "Wait" : "Send"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}
