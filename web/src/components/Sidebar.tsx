"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createNewChat } from "@/app/actions";
import type { ConversationRecord } from "@/lib/conversations";
import type { ProfileRecord } from "@/lib/profile";

export function Sidebar({
  conversations,
  profile,
}: {
  conversations: ConversationRecord[];
  profile: ProfileRecord;
}) {
  const pathname = usePathname();
  const initial = (profile.name || "?").charAt(0).toUpperCase();

  return (
    <aside className="flex h-full w-full flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <DotsLogo />
        <span className="text-sm font-semibold tracking-tight">smartchat</span>
      </div>

      <div className="px-3 py-3">
        <form action={createNewChat}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <PlusIcon />
            New chat
          </button>
        </form>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <p className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
            No chats yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {conversations.map((c) => {
              const href = `/c/${c.slug}`;
              const active = pathname === href;
              return (
                <li key={c.id}>
                  <Link
                    href={href}
                    title={c.title}
                    className={`block truncate rounded-md px-3 py-2 text-sm transition ${
                      active
                        ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {c.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <Link
        href="/profile"
        className="flex items-center gap-3 border-t border-zinc-200 px-4 py-3 text-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-400 text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-medium">{profile.name}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            View profile
          </span>
        </span>
      </Link>
    </aside>
  );
}

function DotsLogo() {
  return (
    <div className="grid h-8 w-8 grid-cols-3 grid-rows-3 place-items-center gap-[2px] rounded-md bg-zinc-900 p-1 dark:bg-zinc-800">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-1 w-1 rounded-full bg-orange-400" />
      ))}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
