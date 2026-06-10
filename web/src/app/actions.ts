"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createConversation } from "@/lib/conversations";

export async function createNewChat() {
  const conversation = await createConversation();
  revalidatePath("/", "layout");
  redirect(`/c/${conversation.slug}`);
}
