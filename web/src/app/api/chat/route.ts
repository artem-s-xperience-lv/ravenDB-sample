import { NextResponse } from "next/server";
import { appendAssistantReply, appendUserMessage } from "@/lib/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { conversationId?: unknown; text?: unknown }
    | null;
  const conversationId =
    typeof body?.conversationId === "string" ? body.conversationId.trim() : "";
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const user = await appendUserMessage(conversationId, text);
    const delayMs = 1500 + Math.floor(Math.random() * 1500);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const assistant = await appendAssistantReply(conversationId);
    return NextResponse.json({ user, assistant, delayMs }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    const status = /not found/i.test(message) ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
