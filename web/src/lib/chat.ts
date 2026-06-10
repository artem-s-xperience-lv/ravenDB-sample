import "server-only";
import { withStore } from "@/lib/ravendb";
import { Conversation } from "@/lib/conversations";

export type ChatRole = "user" | "assistant";

export class ChatMessage {
  constructor(
    public conversationId: string,
    public role: ChatRole,
    public text: string,
    public createdAt: string = new Date().toISOString(),
  ) {}
}

export type ChatMessageRecord = {
  id: string;
  conversationId: string;
  role: ChatRole;
  text: string;
  createdAt: string;
};

const RESPONSES: string[] = [
  "Thanks for the message — let me think about that for a second.",
  "Good question. Here's a quick take: it depends on the context, but a sensible default would be to start small and iterate.",
  "Interesting. There are a few ways to approach it; the cheapest is usually to spike a prototype first.",
  "Happy to help. Could you tell me a bit more about what you've already tried?",
  "Short answer: yes. Long answer: it depends on the constraints you're working with.",
  "Here's how I'd break it down — identify the goal, list the unknowns, then close them one by one.",
  "Got it. The simplest path forward is probably to write the failing test first, then make it pass.",
  "Reasonable ask. I'd lean toward a minimal change rather than a refactor here.",
  "Quick thought: this looks like a state-management problem in disguise.",
  "Let me sketch a path forward — three small steps, each independently shippable.",
  "Fun one. The textbook answer differs from what you'd actually do in production.",
  "I'd start by clarifying the contract between the two pieces, then drill in.",
];

function pickResponse(): string {
  return RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
}

function deriveTitle(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return "New chat";
  return trimmed.length > 50 ? trimmed.slice(0, 47) + "…" : trimmed;
}

export async function listChatMessages(
  conversationId: string,
): Promise<ChatMessageRecord[]> {
  return withStore(async (store) => {
    const session = store.openSession();
    const docs = await session
      .query<ChatMessage>({ collection: "ChatMessages" })
      .whereEquals("conversationId", conversationId)
      .orderBy("createdAt")
      .take(500)
      .all();
    return docs.map((d) => ({
      id: session.advanced.getDocumentId(d) ?? "",
      conversationId: d.conversationId,
      role: d.role,
      text: d.text,
      createdAt: d.createdAt,
    }));
  });
}

export async function appendUserMessage(
  conversationId: string,
  text: string,
): Promise<ChatMessageRecord> {
  return withStore(async (store) => {
    const session = store.openSession();
    const conv = await session.load<Conversation>(conversationId);
    if (!conv) throw new Error("Conversation not found");

    const entity = new ChatMessage(conversationId, "user", text);
    await session.store(entity);

    conv.updatedAt = new Date().toISOString();
    if (conv.title === "New chat") {
      conv.title = deriveTitle(text);
    }

    await session.saveChanges();
    return {
      id: session.advanced.getDocumentId(entity) ?? "",
      conversationId: entity.conversationId,
      role: entity.role,
      text: entity.text,
      createdAt: entity.createdAt,
    };
  });
}

export async function appendAssistantReply(
  conversationId: string,
): Promise<ChatMessageRecord> {
  return withStore(async (store) => {
    const session = store.openSession();
    const conv = await session.load<Conversation>(conversationId);
    if (!conv) throw new Error("Conversation not found");

    const entity = new ChatMessage(conversationId, "assistant", pickResponse());
    await session.store(entity);

    conv.updatedAt = new Date().toISOString();

    await session.saveChanges();
    return {
      id: session.advanced.getDocumentId(entity) ?? "",
      conversationId: entity.conversationId,
      role: entity.role,
      text: entity.text,
      createdAt: entity.createdAt,
    };
  });
}
