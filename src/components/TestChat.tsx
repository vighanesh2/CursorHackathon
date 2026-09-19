"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Turn = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  { label: "Where is my order?", prompt: "Where is my order? I placed it last week." },
  { label: "Returns & exchanges", prompt: "What is your returns and exchanges policy?" },
  { label: "Fabric care", prompt: "How should I wash the linen shirts?" },
  { label: "Sizing", prompt: "I'm between sizes. How does your sizing run?" },
];

const WINDOW_PHOTO =
  "https://api.openverse.org/v1/images/9bc0943a-58eb-47eb-804d-72c4341fe15a/thumb/";

function ShellMark() {
  return (
    <svg className="tide-shell-mark" viewBox="0 0 64 48" aria-hidden="true">
      <path d="M32 6c-7 8-18 14-24 28 8 6 16 8 24 8s16-2 24-8C50 20 39 14 32 6z" />
      <path d="M32 10v32M20 18c4 8 8 14 12 24M44 18c-4 8-8 14-12 24M14 30h36" />
    </svg>
  );
}

export function TestChat() {
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns, loading]);

  async function sendMessage(content: string) {
    if (!content || loading) return;

    const nextTurns: Turn[] = [...turns, { role: "user", content }];
    setTurns(nextTurns);
    setDraft("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextTurns }),
      });
      const payload = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !payload.reply) {
        throw new Error(payload.error ?? "Could not reply.");
      }
      setTurns([...nextTurns, { role: "assistant", content: payload.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reply.");
    } finally {
      setLoading(false);
    }
  }

  function send(event: FormEvent) {
    event.preventDefault();
    void sendMessage(draft.trim());
  }

  return (
    <section className="tide-floor">
      <aside className="tide-rack">
        <div className="tide-panel">
          <ShellMark />
          <p className="tide-kicker">Sea Breeze shop</p>
          <h2>Ask the floor</h2>
          <p className="tide-lede">
            Linen, pine, and the tide outside. Questions about orders, fit, and care land here.
          </p>
        </div>
        <nav className="tide-rack-list" aria-label="Common questions">
          {SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="tide-btn-secondary"
              onClick={() => void sendMessage(item.prompt)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="tide-room">
        <header className="tide-header">
          <img className="tide-window" src={WINDOW_PHOTO} alt="" />
          <div className="tide-header-copy">
            <p className="tide-kicker">Open today · daylight hours</p>
            <h1>
              Shore clerk
              <span className="tide-rule" aria-hidden="true" />
            </h1>
          </div>
        </header>

        <div className="tide-log">
          {turns.length === 0 && !loading ? (
            <div className="tide-empty">
              <p>The counter is clear. Ask about an order, a size, or how to wash a piece.</p>
            </div>
          ) : null}

          {turns.map((turn, index) => (
            <div key={`${turn.role}-${index}`} className={`tide-row ${turn.role}`}>
              <div className="tide-bubble">{turn.content}</div>
            </div>
          ))}

          {loading ? (
            <div className="tide-row assistant">
              <div className="tide-writing" aria-label="Shore clerk is writing">
                <span>Writing</span>
                <i />
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        {error ? <p className="tide-error">{error}</p> : null}

        <form className="tide-counter" onSubmit={send}>
          <label className="tide-counter-label" htmlFor="tide-draft">
            Sand counter
          </label>
          <div className="tide-counter-row">
            <input
              id="tide-draft"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={loading}
              placeholder="Ask about shipping, fit, or fabric…"
            />
            <button className="tide-btn-primary" type="submit" disabled={!draft.trim() || loading}>
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
