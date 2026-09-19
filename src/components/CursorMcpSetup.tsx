"use client";

import { useEffect, useState } from "react";
import { getOrCreateUserId } from "@/lib/user";

export function CursorMcpSetup() {
  const [userId, setUserId] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<"id" | "config" | null>(null);

  useEffect(() => {
    setUserId(getOrCreateUserId());
    setOrigin(window.location.origin);
  }, []);

  const config = JSON.stringify(
    {
      mcpServers: {
        "you-i": {
          url: `${origin}/mcp`,
          headers: {
            "x-you-i-user-id": userId,
          },
        },
      },
    },
    null,
    2,
  );

  async function copy(which: "id" | "config", value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    window.setTimeout(() => setCopied(null), 1500);
  }

  if (!userId) return null;

  return (
    <section className="w-full border border-ink bg-field p-5 text-left">
      <h2 className="font-display text-[16px] font-semibold tracking-[-0.03em]">
        Cursor MCP
      </h2>
      <p className="mt-2 text-[14px] leading-6 text-mute">
        After you save a collection here, Cursor loads it from this hosted MCP.
        Paste this into <code className="text-ink">~/.cursor/mcp.json</code>, then
        enable <span className="text-ink">you-i</span> in Settings → MCP.
      </p>
      <p className="mt-4 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
        Your session id
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="break-all text-[13px] text-ink">{userId}</code>
        <button
          type="button"
          onClick={() => void copy("id", userId)}
          className="h-9 border border-ink px-3 font-display text-[11px] font-semibold uppercase tracking-[0.14em]"
        >
          {copied === "id" ? "Copied" : "Copy id"}
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
    </section>
  );
}
