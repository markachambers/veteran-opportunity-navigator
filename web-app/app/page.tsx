import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { VeteranDashboard } from "@/components/VeteranDashboard";
import { AuthButtons } from "@/components/AuthButtons";
import { ProfileForm } from "@/components/ProfileForm";
import { DocumentUpload } from "@/components/DocumentUpload";
import { VoiceNoteForm } from "@/components/VoiceNoteForm";

export default async function Home() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <main style={{ minHeight: "100vh", padding: 28, background: "radial-gradient(circle at 15% 10%, rgba(45,121,86,0.22), transparent 30%), linear-gradient(135deg, #071421 0%, #10253a 48%, #071421 100%)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
        <div style={{ width: "min(100%, 520px)", margin: "12vh auto 0", padding: 28, border: "1px solid #d9dfd5", borderRadius: 10, background: "#fbfaf6", boxShadow: "0 22px 70px rgba(7,17,28,0.16)" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 36, lineHeight: 1.05, color: "#172132" }}>Sign in to your veteran workspace.</h1>
          <p style={{ color: "#667184", lineHeight: 1.55, marginBottom: 20 }}>Each veteran gets their own private profile, uploads, voice notes, evidence checklist, and meeting packet.</p>
          <AuthButtons />
        </div>
      </main>
    );
  }

  const [{ data: profile }, { data: documents }, { data: notes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("voice_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <main style={{ minHeight: "100vh", padding: 28, background: "radial-gradient(circle at 15% 10%, rgba(45,121,86,0.22), transparent 30%), linear-gradient(135deg, #071421 0%, #10253a 48%, #071421 100%)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, color: "#fff" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(28px,4vw,48px)", lineHeight: 1, fontWeight: 900 }}>Your Veteran Journey Navigator.</h1>
            <p style={{ margin: "8px 0 0", color: "#c6d3dc", lineHeight: 1.5 }}>Every room entered, every room not yet explored, and the evidence needed to open the next door.</p>
          </div>
          <div style={{ minWidth: 200, padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.09)" }}>
            <span style={{ display: "block", color: "#c6d3dc", fontSize: 12 }}>Signed in</span>
            <strong style={{ display: "block", color: "#fff", fontSize: 13 }}>{profile?.display_name || user.email}</strong>
            <form action={signOut}>
              <button type="submit" style={{ width: "100%", marginTop: 10, minHeight: 34, borderRadius: 7, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ background: "#fff", border: "1px solid #d9dfd5", borderRadius: 10, padding: "18px 20px" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800 }}>Veteran Profile</h2>
            <ProfileForm profile={profile} />
          </div>
          <div style={{ background: "#fff", border: "1px solid #d9dfd5", borderRadius: 10, padding: "18px 20px" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>Voice / Typed Intake</h2>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#667184" }}>Record or type your note — saved to your private workspace.</p>
            <VoiceNoteForm />
            {notes && notes.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <strong style={{ fontSize: 13 }}>Saved notes ({notes.length})</strong>
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} style={{ marginTop: 8, padding: "8px 10px", border: "1px solid #d9dfd5", borderRadius: 7 }}>
                    <strong style={{ fontSize: 12 }}>{note.topic}</strong>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#667184" }}>{note.transcript?.slice(0, 100)}{note.transcript?.length > 100 ? "…" : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #d9dfd5", borderRadius: 10, padding: "18px 20px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Missing Document Uploads</h2>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667184" }}>Files upload to your private Supabase Storage bucket.</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid #d9dfd5", color: "#667184" }}>{documents?.length || 0} uploaded</span>
          </div>
          <DocumentUpload userId={user.id} />
        </div>

        <VeteranDashboard profile={profile} userEmail={user.email || ""} documents={documents || []} />
      </div>
    </main>
  );
}
