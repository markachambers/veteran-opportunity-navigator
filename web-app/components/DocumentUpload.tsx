"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

const targets = [
  { id: "rating-decision", title: "Full VA rating decision" },
  { id: "ssdi-records", title: "SSDI award letter or BPQY" },
  { id: "surgery-records", title: "Aortic surgery and dialysis records" },
  { id: "medications", title: "Medication list" },
  { id: "employment", title: "Employment timeline evidence" },
  { id: "personal-statement", title: "Personal statement timeline" }
];

export function DocumentUpload({ userId }: { userId: string }) {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function upload(formData: FormData) {
    startTransition(async () => {
      const file = formData.get("file") as File | null;
      const category = String(formData.get("category") || "");

      if (!file || !file.name) {
        setMessage("Choose a file first.");
        return;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${category}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("evidence-documents")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setMessage(uploadError.message);
        return;
      }

      const { error: insertError } = await supabase.from("documents").insert({
        user_id: userId,
        category,
        file_name: file.name,
        file_path: path,
        status: "uploaded"
      });

      if (insertError) {
        setMessage(insertError.message);
        return;
      }

      formRef.current?.reset();
      setMessage("Document uploaded and linked to your workspace.");
    });
  }

  return (
    <div className="uploads">
      {targets.map((target) => (
        <form key={target.id} ref={formRef} className="uploadRow" action={upload}>
          <strong>{target.title}</strong>
          <input type="hidden" name="category" value={target.id} />
          <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt" />
          <button className="primaryButton" type="submit" disabled={isPending}>
            {isPending ? "Uploading..." : "Upload"}
          </button>
        </form>
      ))}
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
