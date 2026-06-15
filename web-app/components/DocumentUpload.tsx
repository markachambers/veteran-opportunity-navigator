"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

const targets = [
  { id: "service-records", title: "Service Records", note: "DD-214, proof of service, service verification" },
  { id: "va-letters", title: "VA Letters", note: "Benefit summary, FMP, civil service, COE" },
  { id: "rating-decision", title: "Full VA rating decision", note: "Individual ratings, diagnostic codes, reasons" },
  { id: "ssdi-records", title: "SSDI award letter or BPQY", note: "SSDI-to-service-connected condition mapping" },
  { id: "surgery-records", title: "Surgery / hospitalization records", note: "Operations, hospitalizations, complications, residuals, follow-up care" },
  { id: "medications", title: "Medication list", note: "Current treatment profile and functional impact" },
  { id: "employment", title: "Employment timeline evidence", note: "Work history, SSDI context, future consulting strategy" },
  { id: "personal-statement", title: "Personal statement timeline", note: "Symptoms, what changed, daily impact, VSO conversation" },
];

function SingleUpload({ target, userId }: { target: { id: string; title: string; note: string }; userId: string }) {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function upload(formData: FormData) {
    startTransition(async () => {
      const file = formData.get("file") as File | null;
      if (!file || !file.name || file.size === 0) { setMessage("Choose a file first."); return; }
      if (file.size > 10 * 1024 * 1024) { setMessage("File must be under 10 MB."); return; }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${target.id}/${Date.now()}-${safeName}`;

      const { data: existing, error: existingError } = await supabase
        .from("documents")
        .select("id")
        .eq("user_id", userId)
        .eq("category", target.id)
        .eq("file_name", file.name)
        .limit(1);

      if (existingError) { setMessage(`Duplicate check failed: ${existingError.message}`); return; }
      if (existing?.length) { setMessage("Already in vault. Delete the old copy first if you want to replace it."); return; }

      const { error: uploadError } = await supabase.storage.from("evidence-documents").upload(path, file, { upsert: false });
      if (uploadError) { setMessage(`Upload failed: ${uploadError.message}`); return; }

      const { error: insertError } = await supabase.from("documents").insert({
        user_id: userId, category: target.id, file_name: file.name, file_path: path, status: "uploaded"
      });
      if (insertError) { setMessage(`Record failed: ${insertError.message}`); return; }

      formRef.current?.reset();
      setMessage("✓ Uploaded");
      setTimeout(() => setMessage(""), 3000);
    });
  }

  return (
    <form ref={formRef} action={upload} style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <strong style={{ fontSize: 13 }}>{target.title}</strong>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#667184" }}>{target.note}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt" style={{ fontSize: 12, flex: 1 }} />
        <button type="submit" disabled={isPending} style={{ minHeight: 32, padding: "0 14px", borderRadius: 6, border: "none", background: "#172132", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" as const }}>
          {isPending ? "Uploading…" : "Upload"}
        </button>
      </div>
      {message && <p style={{ margin: "4px 0 0", fontSize: 12, color: message.startsWith("✓") ? "#267a56" : "#b6504c" }}>{message}</p>}
    </form>
  );
}

export function DocumentUpload({ userId }: { userId: string }) {
  return (
    <div>
      {targets.map((target) => (
        <SingleUpload key={target.id} target={target} userId={userId} />
      ))}
    </div>
  );
}
