import { AuthButtons } from "@/components/AuthButtons";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ProfileForm } from "@/components/ProfileForm";
import { VoiceNoteForm } from "@/components/VoiceNoteForm";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <main className="page">
        <section className="auth panel">
          <h1>Sign in to your veteran workspace.</h1>
          <p>Each veteran gets their own private profile, uploads, voice notes, evidence checklist, and meeting packet.</p>
          <AuthButtons />
          <p className="muted">
            Configure Google and Apple providers in Supabase Auth before inviting testers.
          </p>
        </section>
      </main>
    );
  }

  const [{ data: profile }, { data: documents }, { data: notes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("voice_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
  ]);

  return (
    <main className="page">
      <div className="shell">
        <header className="hero">
          <div>
            <h1>Your Veteran Journey Navigator.</h1>
            <p>Every room entered, every room not yet explored, and the evidence needed to open the next door.</p>
          </div>
          <form className="account" action={signOut}>
            <span>Signed in</span>
            <strong>{profile?.display_name || user.email}</strong>
            <button type="submit">Sign out</button>
          </form>
        </header>

        <section className="grid">
          <div className="card">
            <h2>Veteran Profile</h2>
            <p className="muted">This replaces local browser state with a per-user Supabase row.</p>
            <ProfileForm profile={profile} />
          </div>

          <div className="card">
            <h2>Missing Document Uploads</h2>
            <p className="muted">Files upload to a private Supabase Storage bucket under this veteran&apos;s user ID.</p>
            <DocumentUpload userId={user.id} />
          </div>

          <div className="card">
            <h2>Voice / Typed Intake</h2>
            <p className="muted">Browser speech-to-text can feed this form, and the saved note belongs only to this signed-in user.</p>
            <VoiceNoteForm />
          </div>

          <div className="card">
            <h2>Workspace Snapshot</h2>
            <div className="facts">
              <div className="fact"><strong>{documents?.length || 0}</strong> uploaded evidence documents</div>
              <div className="fact"><strong>{notes?.length || 0}</strong> saved voice or typed notes</div>
              <div className="fact"><strong>{profile?.current_rating || "Needed"}</strong> current rating</div>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="card">
            <h2>Recent Documents</h2>
            <div className="uploads">
              {(documents || []).map((document) => (
                <div className="uploadRow" key={document.id}>
                  <strong>{document.file_name}</strong>
                  <span className="muted">{document.category} · {document.status}</span>
                </div>
              ))}
              {!documents?.length ? <p className="muted">No documents uploaded yet.</p> : null}
            </div>
          </div>

          <div className="card">
            <h2>Recent Notes</h2>
            <div className="notes">
              {(notes || []).map((note) => (
                <div className="noteRow" key={note.id}>
                  <strong>{note.topic}</strong>
                  <p>{note.transcript}</p>
                </div>
              ))}
              {!notes?.length ? <p className="muted">No voice or typed notes saved yet.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
