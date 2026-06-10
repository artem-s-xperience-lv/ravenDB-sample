import Link from "next/link";
import { getProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6">
        <header className="flex items-center justify-between gap-4 border-b border-orange-300 py-6 dark:border-orange-900">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <BackIcon />
            <span>Back to chat</span>
          </Link>
          <BrandMark />
        </header>

        <div className="py-6">
          <SectionLabel>Your profile</SectionLabel>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            Your name shows above your messages in the chat. Changes save to
            RavenDB.
          </p>
          <ProfileForm profile={profile} />

          <div className="mt-10">
            <SectionLabel>Appearance</SectionLabel>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Choose how smartchat looks. <strong>System</strong> follows your
                operating system setting.
              </p>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-orange-200 dark:bg-orange-900" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-400">
        {children}
      </span>
      <div className="h-px flex-1 bg-orange-200 dark:bg-orange-900" />
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 grid-cols-3 grid-rows-3 place-items-center gap-[2px] rounded-md bg-zinc-900 p-1 dark:bg-zinc-800">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-[3px] w-[3px] rounded-full bg-orange-400"
          />
        ))}
      </div>
      <span className="text-sm font-semibold tracking-tight">smartchat</span>
    </div>
  );
}

function BackIcon() {
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
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
