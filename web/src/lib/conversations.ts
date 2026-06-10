import "server-only";
import { withStore } from "@/lib/ravendb";

const COLLECTION_PREFIX = "conversations/";

export class Conversation {
  constructor(
    public title: string = "New chat",
    public createdAt: string = new Date().toISOString(),
    public updatedAt: string = new Date().toISOString(),
  ) {}
}

export type ConversationRecord = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export function conversationIdToSlug(id: string): string {
  const suffix = id.startsWith(COLLECTION_PREFIX)
    ? id.slice(COLLECTION_PREFIX.length)
    : id;
  return suffix.toLowerCase();
}

export function slugToConversationId(slug: string): string {
  return COLLECTION_PREFIX + slug;
}

export async function listConversations(): Promise<ConversationRecord[]> {
  return withStore(async (store) => {
    const session = store.openSession();
    const docs = await session
      .query<Conversation>({ collection: "Conversations" })
      .orderByDescending("updatedAt")
      .take(200)
      .all();
    return docs.map((d) => {
      const id = session.advanced.getDocumentId(d) ?? "";
      return {
        id,
        slug: conversationIdToSlug(id),
        title: d.title,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });
  });
}

export async function getConversation(
  id: string,
): Promise<ConversationRecord | null> {
  return withStore(async (store) => {
    const session = store.openSession();
    const doc = await session.load<Conversation>(id);
    if (!doc) return null;
    return {
      id,
      slug: conversationIdToSlug(id),
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  });
}

export async function createConversation(): Promise<ConversationRecord> {
  return withStore(async (store) => {
    const session = store.openSession();
    const entity = new Conversation();
    await session.store(entity);
    await session.saveChanges();
    const id = session.advanced.getDocumentId(entity) ?? "";
    return {
      id,
      slug: conversationIdToSlug(id),
      title: entity.title,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  });
}
