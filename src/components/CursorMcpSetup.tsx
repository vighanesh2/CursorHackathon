"use client";

import { useEffect, useState } from "react";
import { getOrCreateUserId } from "@/lib/user";

export function CursorMcpSetup() {
  const [origin, setOrigin] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"token" | "config" | null>(null);

  useEffect(() => {
    const userId = getOrCreateUserId();
    setOrigin(window.location.origin);
    fetch("/api/mcp-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as { token?: string; error?: string };
        if (!response.ok || !payload.token) {
          throw new Error(payload.error ?? "Could not create Cursor token.");
        }
        setToken(payload.token);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not create Cursor token.");
      });
  }, []);

  const config = token
    ? JSON.stringify(
        {
          mcpServers: {
            "you-i": {
              url: `${origin}/mcp`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          },
        },
        null,
        2,
      )
    : "";

  async function copy(which: "token" | "config", value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <section className="w-full border border-ink bg-field p-5 text-left">
      <h2 className="font-display text-[16px] font-semibold tracking-[-0.03em]">
        Connect Cursor
      </h2>
      <p className="mt-2 text-[14px] leading-6 text-mute">
        This token unlocks the collections saved in this browser. Paste the block
        into <code className="text-ink">~/.cursor/mcp.json</code>, then enable{" "}
        <span className="text-ink">you-i</span> in Settings → MCP. Treat it like a
        password.
      </p>
      {error ? <p className="mt-3 text-[14px] text-signal">{error}</p> : null}
      {!token && !error ? (
        <p className="mt-3 text-[14px] text-mute">Creating Cursor token…</p>
      ) : null}
      {token ? (
        <>
          <p className="mt-4 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
            Cursor token
          </p>
          <div className="mt-2 flex flex-wrap items-start gap-2">
            <code className="max-w-full break-all text-[13px] text-ink">{token}</code>
            <button
              type="button"
              onClick={() => void copy("token", token)}
              className="h-9 shrink-0 border border-ink px-3 font-display text-[11px] font-semibold uppercase tracking-[0.14em]"
            >
              {copied === "token" ? "Copied" : "Copy token"}
            </button>
          </div>
          <pre className="mt-4 overflow-x-auto border border-ink/15 bg-canvas p-3 text-[12px] leading-5 text-ink">
            {config}
          </pre>
          <button
            type="button"
            onClick={() => void copy("config", config)}
            className="mt-3 h-9 border border-ink px-3 font-display text-[11px] font-semibold uppercase tracking-[0.14em]"
          >
            {copied === "config" ? "Copied" : "Copy mcp.json"}
          </button>
        </>
      ) : null}
    </section>
  );
}
