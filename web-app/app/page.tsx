import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { VeteranDashboard, KnowledgeGraphLab, ClaimReviewCoach, DocumentTranslator } from "@/components/VeteranDashboard";
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
      <main className="authGate">
        <div className="authPanel">
          <div className="brand authBrand">
            <div className="brandMark" aria-hidden="true">✓</div>
            <div>
              <strong>Veteran Journey</strong>
              <span>Private workspace</span>
            </div>
          </div>
          <h1>Sign in to your veteran workspace.</h1>
          <p>Each veteran gets their own private profile, uploads, voice notes, evidence checklist, and meeting packet.</p>
          <AuthButtons />
          <small>Production sign-in is handled by Supabase Auth. Your documents are scoped to your authenticated user account.</small>
        </div>
      </main>
    );
  }

  const [{ data: profile }, { data: documents }, { data: notes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("voice_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const displayName = profile?.display_name || user.email || "Veteran";
  const branch = profile?.branch || "Air Force";
  const state = profile?.state || "Florida";
  const rating = profile?.current_rating || "90%";
  const workStatus = profile?.work_status || "Unemployed + SSDI";
  const dependentStatus = profile?.dependent_status || "None";

  return (
    <main className="appShell">
      <aside className="sidebar" aria-label="Primary">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">✓</div>
          <div>
            <strong>Veteran Journey</strong>
            <span>Navigator</span>
          </div>
        </div>
        <nav className="navList">
          {[
            ["BD", "Benefits Discovery"],
            ["ES", "Eligibility Screening"],
            ["CP", "Claims Preparation"],
            ["DO", "Document Organization"],
            ["BE", "Benefit Education"],
            ["RD", "Resource Directory"],
            ["RN", "Referral Network"]
          ].map(([icon, label], index) => (
            <button key={label} className={`navItem ${index === 0 ? "active" : ""}`} type="button">
              <span className="navIcon">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebarFoot">
          <span className="sidebarFootIcon">↻</span>
          <div>
            <strong>Human help ready</strong>
            <span>Referral partners verified</span>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <h1>Your Veteran Journey Navigator.</h1>
            <p>Every room you've entered, every room not yet explored, and the evidence needed to open the next door.</p>
          </div>
          <form className="accountCard" action={signOut}>
            <span>Signed in</span>
            <strong>{displayName}</strong>
            <button type="submit">Sign out</button>
          </form>
          <div className="topbarStats" aria-label="Navigator impact metrics">
            <div><strong>{24 + 8}</strong><span>likely matches</span></div>
            <div><strong>{rating}</strong><span>SC rating</span></div>
            <div><strong>2</strong><span>answers needed</span></div>
          </div>
        </header>

        <section className="commandBand" aria-label="Opportunity search">
          <div className="commandInput">
            <span>⌕</span>
            <input placeholder="What opportunity should we check today?" />
          </div>
          <div className="profileSwitch" aria-label="Profile type">
            <button className="active" type="button">Veteran</button>
            <button type="button">Spouse</button>
            <button type="button">Caregiver</button>
          </div>
        </section>

        <section className="progressBand" aria-label="Intake progress">
          {["Identity", "Service", "Rating", "Decision letter", "Florida"].map((step, index) => (
            <div key={step} className={`step ${index === 3 ? "active" : "done"}`}>
              <span>{index === 3 ? "4" : "✓"}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </section>

        <section className="testProfile panel" aria-label="Current veteran profile">
          <div>
            <span className="sectionLabel">Private workspace</span>
            <h2>{branch} veteran, {state} resident, {rating} service-connected</h2>
            <p>This live version uses Supabase Auth, user-scoped database rows, and private evidence storage while preserving the local navigator experience.</p>
          </div>
          <div className="profileFacts">
            <span>Branch: {branch}</span>
            <span>Rating: {rating}</span>
            <span>Work: {workStatus}</span>
            <span>State: {state}</span>
            <span>Dependents: {dependentStatus}</span>
            <span>Documents: {documents?.length || 0}</span>
            <span>Voice notes: {notes?.length || 0}</span>
            <span>Account: Private</span>
          </div>
        </section>

        <section className="advisor">
          <div className="advisorIcon">AI</div>
          <div>
            <strong>AI advisor</strong>
            <p>For your {branch} veteran, {state} resident, {rating} service-connected profile, start with schedular review opportunities. Current strategy favors schedular evidence review over TDIU so future work and consulting options stay open.</p>
          </div>
          <button type="button">Prepare packet <span>→</span></button>
        </section>

        <section className="liveIntakeGrid">
          <div className="panel livePanel">
            <div className="panelHeader tight">
              <div>
                <h2>Veteran Profile</h2>
                <p>Saved directly to your private Supabase profile row.</p>
              </div>
            </div>
            <ProfileForm profile={profile} />
          </div>
          <div className="panel livePanel">
            <div className="panelHeader tight">
              <div>
                <h2>Voice / Typed Intake</h2>
                <p>Record or type your note, then save it to this veteran workspace.</p>
              </div>
            </div>
            <VoiceNoteForm />
            {notes && notes.length > 0 ? (
              <div className="liveNoteList">
                <strong>Saved notes ({notes.length})</strong>
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="noteRow">
                    <strong>{note.topic}</strong>
                    <p>{note.transcript?.slice(0, 120)}{note.transcript?.length > 120 ? "..." : ""}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel livePanel evidenceUploadPanel">
          <div className="panelHeader tight">
            <div>
              <h2>Evidence Uploads</h2>
              <p>Files upload to your private Supabase Storage bucket. Each upload updates this user’s evidence inventory.</p>
            </div>
            <div className="intakeSignal">{documents?.length || 0} uploaded</div>
          </div>
          <DocumentUpload userId={user.id} />
        </section>

        <VeteranDashboard profile={profile} userEmail={user.email || ""} documents={documents || []} />
        <DocumentTranslator />
        <KnowledgeGraphLab />
        <ClaimReviewCoach />
      </div>
    </main>
  );
}
