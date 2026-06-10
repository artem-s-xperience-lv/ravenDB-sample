import { NextResponse } from "next/server";
import { getProfile, updateProfile } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { name?: unknown; bio?: unknown }
    | null;
  const patch: { name?: string; bio?: string } = {};
  if (typeof body?.name === "string") {
    const trimmed = body.name.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "name cannot be empty" },
        { status: 400 },
      );
    }
    patch.name = trimmed;
  }
  if (typeof body?.bio === "string") patch.bio = body.bio.trim();
  const profile = await updateProfile(patch);
  return NextResponse.json({ profile });
}
