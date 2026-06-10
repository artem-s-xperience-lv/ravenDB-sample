"use client";

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { ChatMessageRecord } from "@/lib/chat";
import type { ConversationRecord } from "@/lib/conversations";
import type { ProfileRecord } from "@/lib/profile";
import { useSidebar } from "@/components/SidebarProvider";

type ChatProps = {
  conversation: ConversationRecord;
  messages: ChatMessageRecord[];
  profile: ProfileRecord;
};

export function Chat({ conversation, messages, profile }: ChatProps) {
  const router = useRouter();
  const { open: sidebarOpen, setOpen: setSidebarOpen, toggle: toggleSidebar } =
    useSidebar();
  const [pending, startTransition] = useTransition();
  const [optimisticMessages, addOptimistic] = useOptimistic<
    ChatMessageRecord[],
    ChatMessageRecord
  >(messages, (state, m) => [...state, m]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [optimisticMessages.length, pending]);

  function collapseSidebar() {
    if (sidebarOpen) setSidebarOpen(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value || pending) return;
    setText("");
    startTransition(async () => {
      addOptimistic({
        id: `optimistic-${Date.now()}`,
        conversationId: conversation.id,
        role: "user",
        text: value,
        createdAt: new Date().toISOString(),
      });
      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversation.id,
            text: value,
          }),
        });
      } finally {
        router.refresh();
      }
    });
  }

  return (
    <main
      onClick={collapseSidebar}
      className="flex h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <header className="flex items-center gap-3 border-b border-orange-300 px-6 py-4 dark:border-orange-900">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          aria-label={sidebarOpen ? "Hide chat list" : "Show chat list"}
          aria-expanded={sidebarOpen}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <MenuIcon />
        </button>
        <h1 className="truncate text-base font-semibold" title={conversation.title}>
          {conversation.title}
        </h1>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-6"
      >
        <div className="mx-auto w-full max-w-3xl">
          <SectionLabel>Conversation</SectionLabel>
          {optimisticMessages.length === 0 && !pending ? (
            <EmptyState name={profile.name} />
          ) : (
            <ul className="flex flex-col gap-4">
              {optimisticMessages.map((m) => (
                <li key={m.id}>
                  {m.role === "user" ? (
                    <UserBubble name={profile.name} text={m.text} />
                  ) : (
                    <AssistantBubble text={m.text} />
                  )}
                </li>
              ))}
              {pending && (
                <li>
                  <ThinkingBubble />
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-zinc-50 px-6 pb-6 pt-2 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-3xl">
          <p className="mb-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {pending
              ? "Generating reply…"
              : `Signed in as ${profile.name}. Ask anything.`}
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1.5 shadow-sm focus-within:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:border-zinc-600"
          >
            <button
              type="button"
              aria-label="Attach"
              disabled
              className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 dark:text-zinc-600"
            >
              <PaperclipIcon />
            </button>
            <input
              autoFocus
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                collapseSidebar();
              }}
              placeholder="Describe your situation or ask a question…"
              className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={pending || !text.trim()}
              className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-orange-200 dark:bg-orange-900" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-400">
        {children}
      </span>
      <div className="h-px flex-1 bg-orange-200 dark:bg-orange-900" />
    </div>
  );
}

function EmptyState({ name }: { name: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
        Hi {name} — say hello to start the chat.
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Replies are randomized for demo purposes and stored in RavenDB.
      </p>
    </div>
  );
}

function UserBubble({ name, text }: { name: string; text: string }) {
  return (
    <div className="rounded-lg bg-zinc-100 px-5 py-4 dark:bg-zinc-900">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {name}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
        {text}
      </p>
    </div>
  );
}

function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center gap-2">
        <DotsLogo small />
        <span className="text-sm font-semibold">SMARTBOT</span>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
          Reply
        </span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
        {text}
      </p>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center gap-2">
        <DotsLogo small />
        <span className="text-sm font-semibold">SMARTBOT</span>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
          Thinking
        </span>
      </div>
      <ThinkingDots />
    </div>
  );
}

function ThinkingDots() {
  return (
    <div
      className="flex items-center gap-1.5"
      role="status"
      aria-label="Thinking"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-orange-400"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function DotsLogo({ small = false }: { small?: boolean }) {
  if (small) {
    return (
      <div className="grid h-7 w-7 grid-cols-3 grid-rows-3 place-items-center gap-[2px] rounded-md bg-zinc-900 p-1 dark:bg-zinc-800">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-[3px] w-[3px] rounded-full bg-orange-400"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid h-10 w-10 grid-cols-3 grid-rows-3 place-items-center gap-[3px] rounded-md bg-zinc-900 p-1.5 dark:bg-zinc-800">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-1 w-1 rounded-full bg-orange-400" />
      ))}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function SendIcon() {
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
      <path d="M3 11 21 3 13 21l-2-8-8-2z" />
    </svg>
  );
}

function PaperclipIcon() {
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
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
