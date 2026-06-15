import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { VeteranDashboard, KnowledgeGraphLab, ClaimReviewCoach, DocumentTranslator, NonVaBenefits, SecondaryOpportunityExplorer } from "@/components/VeteranDashboard";
import { AuthButtons } from "@/components/AuthButtons";
import { ProfileForm } from "@/components/ProfileForm";
import { DocumentUpload } from "@/components/DocumentUpload";
import { VoiceNoteForm } from "@/components/VoiceNoteForm";

const stateAliases: Record<string, string> = {
  FL: "Florida",
  DC: "District of Columbia",
};

function displayState(state?: string | null) {
  if (!state) return "Florida";
  return stateAliases[state.toUpperCase()] || state;
}

function isRankLike(value?: string | null) {
  return /^(E|O|W)-?[0-9]$/i.test(value || "");
}

function displayRating(value?: string | null) {
  if (!value || isRankLike(value)) return "Add rating";
  return value;
}

function displayRank(profile: any) {
  const rank = profile?.rank_pay_grade || (isRankLike(profile?.current_rating) ? profile?.current_rating : "");
  return rank || "Add rank";
}

function displayDependents(value?: string | null) {
  if (!value || value === "0") return "None";
  return value;
}

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
  const state = displayState(profile?.state);
  const rating = displayRating(profile?.current_rating);
  const rank = displayRank(profile);
  const workStatus = profile?.work_status || "Unemployed + SSDI";
  const dependentStatus = displayDependents(profile?.dependent_status);
  const serviceStatus = profile?.service_status || "Honorable";
  const permanentTotalStatus = profile?.permanent_total_status || "No";
  const monthlyAward = profile?.monthly_award || "Add award";
  const vaLoanStatus = profile?.va_loan_status || "Add VA loan";
  const federalPreference = profile?.federal_preference_status || "Add preference";
  const fmpStatus = profile?.fmp_status || "Add FMP";

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
            ["BD", "Benefits Discovery", "#benefits-discovery"],
            ["ES", "Eligibility Screening", "#eligibility-screening"],
            ["NV", "Non-VA Benefits", "#non-va-benefits"],
            ["CP", "Claims Preparation", "#claims-preparation"],
            ["SO", "Secondary Explorer", "#secondary-opportunity-explorer"],
            ["DO", "Document Organization", "#document-organization"],
            ["BE", "Benefit Education", "#benefit-education"],
            ["RD", "Resource Directory", "#resource-directory"],
            ["RN", "Referral Network", "#referral-network"]
          ].map(([icon, label, href], index) => (
            <a key={label} className={`navItem ${index === 0 ? "active" : ""}`} href={href}>
              <span className="navIcon">{icon}</span>
              <span>{label}</span>
            </a>
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

        <section id="benefits-discovery" className="testProfile panel anchorSection" aria-label="Current veteran profile">
          <div>
            <span className="sectionLabel">Private workspace</span>
            <h2>{branch} veteran, {state} resident, {rating} service-connected</h2>
            <p>This live version uses Supabase Auth, user-scoped database rows, and private evidence storage while preserving the local navigator experience.</p>
          </div>
          <div className="profileFacts">
            <span>Branch: {branch}</span>
            <span>Rating: {rating}</span>
            <span>Rank: {rank}</span>
            <span>Service: {serviceStatus}</span>
            <span>Work: {workStatus}</span>
            <span>State: {state}</span>
            <span>Dependents: {dependentStatus}</span>
            <span>P&T: {permanentTotalStatus}</span>
            <span>Monthly award: {monthlyAward}</span>
            <span>VA loan: {vaLoanStatus}</span>
            <span>Federal preference: {federalPreference}</span>
            <span>FMP: {fmpStatus}</span>
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

        <section id="eligibility-screening" className="liveIntakeGrid anchorSection">
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

        <section id="document-organization" className="panel livePanel evidenceUploadPanel anchorSection">
          <div className="panelHeader tight">
            <div>
              <h2>Evidence Uploads</h2>
              <p>Files upload to your private Supabase Storage bucket. Each upload updates this user’s evidence inventory.</p>
            </div>
            <div className="intakeSignal">{documents?.length || 0} uploaded</div>
          </div>
          <DocumentUpload userId={user.id} />
        </section>

        <section id="non-va-benefits" className="anchorSection">
          <NonVaBenefits profile={profile} />
        </section>

        <section id="claims-preparation" className="anchorSection">
          <VeteranDashboard profile={profile} userEmail={user.email || ""} documents={documents || []} />
        </section>
        <section id="secondary-opportunity-explorer" className="anchorSection">
          <SecondaryOpportunityExplorer documents={documents || []} />
        </section>
        <section id="benefit-education" className="anchorSection">
          <DocumentTranslator />
        </section>
        <section id="resource-directory" className="anchorSection">
          <KnowledgeGraphLab />
        </section>
        <section id="referral-network" className="anchorSection">
          <ClaimReviewCoach />
        </section>
      </div>
    </main>
  );
}
