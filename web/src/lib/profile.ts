import "server-only";
import { withStore } from "@/lib/ravendb";

const PROFILE_ID = "profiles/me";

export class Profile {
  constructor(
    public name: string,
    public bio: string = "",
    public updatedAt: string = new Date().toISOString(),
  ) {}
}

export type ProfileRecord = {
  id: string;
  name: string;
  bio: string;
  updatedAt: string;
};

export async function getProfile(): Promise<ProfileRecord> {
  return withStore(async (store) => {
    const session = store.openSession();
    let doc = await session.load<Profile>(PROFILE_ID);
    if (!doc) {
      doc = new Profile("You");
      await session.store(doc, PROFILE_ID);
      await session.saveChanges();
    }
    return {
      id: PROFILE_ID,
      name: doc.name,
      bio: doc.bio,
      updatedAt: doc.updatedAt,
    };
  });
}

export type ProfilePatch = Partial<Pick<ProfileRecord, "name" | "bio">>;

export async function updateProfile(
  patch: ProfilePatch,
): Promise<ProfileRecord> {
  return withStore(async (store) => {
    const session = store.openSession();
    let doc = await session.load<Profile>(PROFILE_ID);
    if (!doc) {
      doc = new Profile(patch.name ?? "You", patch.bio ?? "");
      await session.store(doc, PROFILE_ID);
    } else {
      if (patch.name !== undefined) doc.name = patch.name;
      if (patch.bio !== undefined) doc.bio = patch.bio;
      doc.updatedAt = new Date().toISOString();
    }
    await session.saveChanges();
    return {
      id: PROFILE_ID,
      name: doc.name,
      bio: doc.bio,
      updatedAt: doc.updatedAt,
    };
  });
}
