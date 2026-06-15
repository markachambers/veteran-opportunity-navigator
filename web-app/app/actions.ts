"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function normalizeState(value: string) {
  const trimmed = value.trim();
  return stateNames[trimmed.toUpperCase()] || trimmed;
}

function isRankLike(value: string) {
  return /^(E|O|W)-?[0-9]$/i.test(value.trim());
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function upsertProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/");

  const rawRating = formValue(formData, "current_rating");
  const rawRank = formValue(formData, "rank_pay_grade");

  const payload = {
    id: userData.user.id,
    display_name: formValue(formData, "display_name"),
    branch: formValue(formData, "branch"),
    state: normalizeState(formValue(formData, "state")),
    current_rating: isRankLike(rawRating) ? "" : rawRating,
    rank_pay_grade: rawRank || (isRankLike(rawRating) ? rawRating.toUpperCase().replace(/^([EOW])([0-9])$/, "$1-$2") : ""),
    service_status: formValue(formData, "service_status"),
    work_status: formValue(formData, "work_status"),
    dependent_status: formValue(formData, "dependent_status"),
    permanent_total_status: formValue(formData, "permanent_total_status"),
    monthly_award: formValue(formData, "monthly_award"),
    va_loan_status: formValue(formData, "va_loan_status"),
    federal_preference_status: formValue(formData, "federal_preference_status"),
    fmp_status: formValue(formData, "fmp_status")
  };

  const { error } = await supabase.from("profiles").upsert(payload);
  if (error) {
    await supabase.from("profiles").upsert({
      id: payload.id,
      display_name: payload.display_name,
      branch: payload.branch,
      state: payload.state,
      current_rating: payload.current_rating,
      service_status: payload.service_status,
      work_status: payload.work_status,
      dependent_status: payload.dependent_status,
      permanent_total_status: payload.permanent_total_status,
    });
  }
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
