"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Turn = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  { label: "Today’s loaves", prompt: "What breads came out of the oven today?" },
  { label: "Order a cake", prompt: "I need to order a birthday cake for Saturday." },
  { label: "Hours & pickup", prompt: "What are your hours and how does pickup work?" },
];

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
    <section className="hearth-room">
      <header className="hearth-header">
        <p className="hearth-kicker">Rustic Hearth bakery</p>
        <div className="hearth-rise-mask">
          <h1 className="hearth-rise">The oven is open</h1>
        </div>
      </header>

      <div className="hearth-log">
        {turns.length === 0 && !loading ? (
          <div className="hearth-empty">
            <p>Ask the counter about bread, cakes, or when to pick up.</p>
            <div className="hearth-chips">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="hearth-btn-secondary"
                  onClick={() => void sendMessage(item.prompt)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {turns.map((turn, index) => (
          <div key={`${turn.role}-${index}`} className={`hearth-row ${turn.role}`}>
            <div className="hearth-bubble">{turn.content}</div>
          </div>
        ))}

        {loading ? (
          <div className="hearth-row assistant">
            <div className="hearth-writing" aria-label="Writing">
              Writing
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {error ? <p className="hearth-error">{error}</p> : null}

      <form className="hearth-counter" onSubmit={send}>
        <label htmlFor="hearth-draft">Flour counter</label>
        <div className="hearth-counter-row">
          <input
            id="hearth-draft"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={loading}
            placeholder="Ask about an order or a loaf…"
          />
          <button className="hearth-btn-primary" type="submit" disabled={!draft.trim() || loading}>
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
