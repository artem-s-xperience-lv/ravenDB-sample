import { listConversations } from "@/lib/conversations";
import { getProfile } from "@/lib/profile";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarProvider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, profile] = await Promise.all([
    listConversations(),
    getProfile(),
  ]);
  return (
    <SidebarProvider
      sidebar={<Sidebar conversations={conversations} profile={profile} />}
    >
      {children}
    </SidebarProvider>
  );
}
