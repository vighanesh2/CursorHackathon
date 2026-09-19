import { NextResponse } from "next/server";
import { UUID_RE } from "@/lib/ids";
import { issueMcpToken } from "@/lib/mcp-token";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: string };
    const userId = body.userId?.trim();
    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: "A valid user id is required." }, { status: 400 });
    }
    return NextResponse.json({ token: issueMcpToken(userId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create Cursor token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
