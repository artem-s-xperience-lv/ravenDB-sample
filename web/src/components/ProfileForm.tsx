"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProfileRecord } from "@/lib/profile";

export function ProfileForm({ profile }: { profile: ProfileRecord }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, bio }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "Failed to save");
        return;
      }
      const data = (await res.json()) as { profile: ProfileRecord };
      setSavedAt(data.profile.updatedAt);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <label className="mb-4 block">
        <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
        />
      </label>
      <label className="mb-4 block">
        <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Bio
        </span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="A short description (optional)"
          className="w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
        />
      </label>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Stored in RavenDB as{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
          {profile.id}
        </code>
        {savedAt
          ? ` · saved ${new Date(savedAt).toLocaleTimeString()}`
          : profile.updatedAt
            ? ` · last update ${new Date(profile.updatedAt).toLocaleString()}`
            : ""}
      </p>
      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex items-center justify-end gap-2">
        <Link
          href="/"
          className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
