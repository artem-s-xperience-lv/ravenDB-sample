import { redirect } from "next/navigation";
import { listConversations } from "@/lib/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const conversations = await listConversations();
  if (conversations.length > 0) {
    redirect(`/c/${conversations[0].slug}`);
  }
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Welcome to smartchat</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Click <strong>New chat</strong> in the sidebar to start a conversation.
        </p>
      </div>
    </div>
  );
}
