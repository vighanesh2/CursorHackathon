import { createHmac, timingSafeEqual } from "node:crypto";
import { UUID_RE } from "@/lib/ids";

function tokenSecret() {
  const secret = process.env.MCP_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("MCP_TOKEN_SECRET or SUPABASE_SERVICE_ROLE_KEY is required to sign Cursor tokens.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function issueMcpToken(userId: string) {
  if (!UUID_RE.test(userId)) {
    throw new Error("A valid user id is required.");
  }
  const payload = Buffer.from(JSON.stringify({ u: userId, v: 1 })).toString("base64url");
  return `yi1.${payload}.${sign(payload)}`;
}

export function userIdFromCredential(value: string | null | undefined) {
  const raw = value?.trim();
  if (!raw) return null;

  if (raw.startsWith("yi1.")) {
    const parts = raw.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const sig = parts[2];
    if (!safeEqual(sig, sign(payload))) return null;
    try {
      const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
        u?: string;
      };
      return data.u && UUID_RE.test(data.u) ? data.u : null;
    } catch {
      return null;
    }
  }

  return UUID_RE.test(raw) ? raw : null;
}
