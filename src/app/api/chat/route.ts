import { NextResponse } from "next/server";
import { chatReply, type ChatTurn } from "@/lib/groq";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: ChatTurn[] };
    const messages = (body.messages ?? []).filter(
      (turn) =>
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string" &&
        turn.content.trim(),
    );

    if (!messages.length) {
      return NextResponse.json({ error: "Type a message first." }, { status: 400 });
    }

    const reply = await chatReply(messages.slice(-12));
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reply.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
