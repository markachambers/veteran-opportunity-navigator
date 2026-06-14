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

export async function deleteDocument(formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/");

  const id = String(formData.get("document_id") || "");
  if (!id) return;

  const { data: document } = await supabase
    .from("documents")
    .select("id,file_path")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!document) return;

  await supabase.storage.from("evidence-documents").remove([document.file_path]);
  await supabase.from("documents").delete().eq("id", document.id).eq("user_id", userData.user.id);
  revalidatePath("/");
}

export async function deleteDuplicateDocuments(formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/");

  const ids = formData.getAll("duplicate_document_id").map(String).filter(Boolean);
  if (!ids.length) return;

  const { data: documents } = await supabase
    .from("documents")
    .select("id,file_path")
    .eq("user_id", userData.user.id)
    .in("id", ids);

  if (!documents?.length) return;

  const paths = documents.map((document) => document.file_path).filter(Boolean);
  if (paths.length) {
    await supabase.storage.from("evidence-documents").remove(paths);
  }

  await supabase
    .from("documents")
    .delete()
    .eq("user_id", userData.user.id)
    .in("id", documents.map((document) => document.id));

  revalidatePath("/");
}
