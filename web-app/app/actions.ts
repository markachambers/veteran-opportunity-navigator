"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function upsertProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/");

  const payload = {
    id: userData.user.id,
    display_name: String(formData.get("display_name") || ""),
    branch: String(formData.get("branch") || ""),
    state: String(formData.get("state") || ""),
    current_rating: String(formData.get("current_rating") || ""),
    work_status: String(formData.get("work_status") || ""),
    dependent_status: String(formData.get("dependent_status") || "")
  };

  await supabase.from("profiles").upsert(payload);
  revalidatePath("/");
}

export async function saveVoiceNote(formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/");

  await supabase.from("voice_notes").insert({
    user_id: userData.user.id,
    topic: String(formData.get("topic") || "Personal statement timeline"),
    transcript: String(formData.get("transcript") || "")
  });

  revalidatePath("/");
}
