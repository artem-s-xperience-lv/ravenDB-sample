import { notFound } from "next/navigation";
import { listChatMessages } from "@/lib/chat";
import { getConversation, slugToConversationId } from "@/lib/conversations";
import { getProfile } from "@/lib/profile";
import { Chat } from "@/components/Chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const id = slugToConversationId(slug);
  const conversation = await getConversation(id);
  if (!conversation) notFound();
  const [messages, profile] = await Promise.all([
    listChatMessages(id),
    getProfile(),
  ]);
  return (
    <Chat conversation={conversation} messages={messages} profile={profile} />
  );
}
