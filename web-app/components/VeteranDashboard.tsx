"use client";

import { useState } from "react";

const categories = [
  { name: "Federal", initials: "FE", color: "green", count: 10, value: "Confirmed", items: ["30%+ civil-service preference proof", "No-cost VA health care and prescriptions", "VR&E eligibility screen"], source: "Civil service letter / VA matrix" },
  { name: "Florida", initials: "FL", color: "gold", count: 9, value: "Unlocked", items: ["Free lifetime state park pass", "FDVA/CVSO benefits counseling", "P&T-only tax/ID benefits currently conditional"], source: "FDVA / Florida State Parks" },
  { name: "Commissary", initials: "CX", color: "teal", count: 3, value: "Likely", items: ["Commissary access", "Exchange access", "MWR retail facility access"], source: "VA News / DoD access" },
  { name: "Education", initials: "ED", color: "blue", count: 4, value: "Check", items: ["Florida tuition waiver check", "Priority registration if using GI Bill", "VR&E education or training path"], source: "FDVA education" },
  { name: "Owner/Buyer", initials: "HO", color: "red", count: 7, value: "Strong", items: ["VA funding-fee exemption confirmed", "Prior entitlement charged: $87,575", "Restoration or remaining-entitlement strategy"], source: "VA COE / FDVA housing" },
  { name: "FMP/Health", initials: "FM", color: "green", count: 9, value: "Authorized", items: ["Foreign Medical Program for SC conditions", "Condition list captured", "Travel reimbursement check"], source: "FMP authorization / VA matrix" },
  { name: "Schedular Review", initials: "SR", color: "gold", count: 8, value: "High", items: ["90-to-100 evidence matrix", "Map SSDI basis to SC conditions", "Need individual rating breakdown"], source: "VA rating evidence review" },
  { name: "No Dependents", initials: "FA", color: "teal", count: 1, value: "Closed", items: ["No spouse/dependent add-on", "Skip spouse Aid and Attendance", "Skip dependent scholarship unless status changes"], source: "VA compensation rates" },
];

const actions = [
  { title: "Build schedular 90-to-100 evidence matrix", meta: "Preserves future work options while reviewing increases, secondaries, and residuals", priority: "High" },
  { title: "Map SSDI basis to service-connected conditions", meta: "Use SSA evidence to understand overlap, not to force a TDIU posture", priority: "Today" },
  { title: "Retrieve individual rating breakdown when VA access returns", meta: "Needed to see which conditions, diagnostic codes, and last exams may warrant review", priority: "Next" },
  { title: "Plan next VA-backed home purchase", meta: "COE confirms funding-fee exemption and $87,575 prior entitlement charged; check restoration or remaining entitlement", priority: "Open" },
  { title: "Use civil-service letter for federal applications", meta: "Document verifies honorable separation and 30%+ service-connected disability compensation", priority: "Open" },
  { title: "Claim Florida free lifetime state park pass", meta: "Service-connected veterans can qualify with proof of status and honorable discharge", priority: "Open" },
];

const evidenceConfig = [
  { category: "Service Records", docCategory: "service-records", note: "Service verification and proof of honorable service captured." },
  { category: "VA Letters", docCategory: "va-letters", note: "Benefit summary, FMP, civil-service, and COE letters captured." },
  { category: "Rating Decisions", docCategory: "rating-decision", note: "Need full decision with individual ratings, diagnostic codes, and reasons." },
  { category: "SSDI Records", docCategory: "ssdi-records", note: "Need award letter or BPQY showing SSA-recognized conditions." },
  { category: "Surgical Records", docCategory: "surgery-records", note: "Need aortic surgery, dialysis episode, follow-up care, and residual notes." },
  { category: "Medication List", docCategory: "medications", note: "Needed for current treatment profile and functional impact." },
  { category: "Employment Timeline", docCategory: "employment", note: "Needed to understand work limits and timeline context." },
  { category: "Personal Statement Timeline", docCategory: "personal-statement", note: "Needed to explain symptoms, changes, and daily limitations." },
];

const opportunityScores = [
  { area: "State Benefits", opportunity: "High", note: "Florida benefits and county-level savings should be investigated." },
  { area: "Home Loan Entitlement Review", opportunity: "Medium", note: "COE confirms funding-fee exemption and prior entitlement charged." },
  { area: "Florida Property Tax", opportunity: "Medium", note: "Worth investigating as homeowner; P&T-only items remain conditional." },
  { area: "Schedular Increase Review", opportunity: "High", note: "Preferred personal path because it preserves future work and consulting options." },
  { area: "VR&E", opportunity: "Medium", note: "Explore if education, training, or independent-living support is useful." },
  { area: "Foreign Medical Program", opportunity: "Active", note: "Authorization is verified for service-connected conditions abroad." },
  { area: "Federal Employment Preference", opportunity: "Active", note: "Civil-service letter verifies 30%+ preference support." },
  { area: "Post-Surgical Residual Review", opportunity: "Investigate", note: "Aortic surgery, dialysis, numbness, scars, and monitoring need chronology." },
];

const lifeEvents = [
  { when: "1985-1988", title: "Air Force service", status: "Verified", detail: "Service records verify honorable Air Force service." },
  { when: "~2007", title: "Aortic aneurysm history", status: "Unconfirmed", detail: "Exact event, records, facility, and diagnosis timeline needed." },
  { when: "2023", title: "Emergency hospitalization", status: "Unconfirmed", detail: "Hospital records and discharge summary needed." },
  { when: "2025", title: "Major aortic surgery", status: "Unconfirmed", detail: "Operative report, surgeon notes, and follow-up plan needed." },
  { when: "2025", title: "Dialysis episode", status: "Unconfirmed", detail: "Duration, cause, facility, and relation to surgery need documentation." },
  { when: "2025-now", title: "Residual numbness and monitoring", status: "Investigate", detail: "Provider notes, neuro findings, scar documentation, and current limitations needed." },
  { when: "2026", title: "Current VA/FMP evidence", status: "Verified", detail: "VA letters verify rating status, FMP condition list, preference, and loan eligibility." },
];

const conditionMatrix = [
  { condition: "Sleep apnea", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Yellow" },
  { condition: "Depression", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Yellow" },
  { condition: "Lumbar spine", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Red" },
  { condition: "Radiculopathy", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Red" },
  { condition: "Aortic residuals", va: "Unknown", ssdi: "Unknown", rating: "N/A", lastExam: "Recent", worsening: "Investigate", ready: "Red" },
];

const journeyItems = [
  { date: "Aug 1985 - May 1988", title: "Air Force service", status: "Verified", text: "VA service verification confirms honorable Air Force service for this period." },
  { date: "Apr 1, 2026", title: "Current award status", status: "Verified", text: "Benefit summary shows 90% combined service-connected evaluation, monthly award, and not P&T." },
  { date: "Mar 31, 2026", title: "Home loan eligibility", status: "Verified", text: "COE confirms Chapter 37 eligibility, funding-fee exemption, and prior entitlement charged." },
  { date: "Jun 14, 2026", title: "Evidence packet grows", status: "Mapped", text: "Civil-service preference, proof of service, FMP authorization, and benefit summary now support separate benefit lanes." },
  { date: "Next", title: "Claim research questions", status: "Open", text: "Individual ratings, SSDI basis, employment history, surgery residual records, and provider notes are still needed." },
];

const briefSections = [
  { title: "Verified story", points: ["Air Force service verified as honorable from Aug. 20, 1985 to May 24, 1988.", "Benefit summary verifies 90% combined service-connected evaluation and not P&T.", "FMP authorization lists VA-adjudicated service-connected conditions."] },
  { title: "Benefits already supported", points: ["VA compensation and monthly award are verified.", "VA home loan eligibility and funding-fee exemption are verified.", "Federal civil-service preference support is verified at 30%+ service-connected compensation."] },
  { title: "Open questions", points: ["Individual ratings and diagnostic codes are still needed.", "SSDI basis must be mapped to service-connected conditions.", "Surgery residuals need medical chronology and accredited review."] },
  { title: "Next conversation", points: ["Ask a VSO which schedular increase or secondary-condition lanes are most evidence-ready.", "Ask what records best document worsening, residuals, and current functional limits.", "Ask how prior VA loan entitlement affects another home purchase."] },
];

const schedularStrategies = [
  { title: "No work restriction", text: "Schedular 100% does not require remaining unable to work; it better fits a future consulting/CES path." },
  { title: "VA combined math needs evidence", text: "At 90%, the app needs individual ratings and new/worsened conditions to identify realistic paths." },
  { title: "Best review lanes", text: "Post-surgical residuals, secondaries, worsening of current SC conditions, and updated exams." },
];

const vaultDocuments = [
  { name: "benefit_summary.pdf", tags: ["VA Letter", "Rating"], linked: "Current award status" },
  { name: "foreign_medical_program.pdf", tags: ["Medical", "VA Letter"], linked: "SC condition map" },
  { name: "certificate_of_eligibility_home_loan.pdf", tags: ["Housing", "VA Letter"], linked: "Home loan entitlement" },
  { name: "service_verification.pdf", tags: ["Service"], linked: "Air Force service" },
  { name: "civil_service.pdf", tags: ["Employment"], linked: "Federal preference" },
  { name: "Needed: SSDI award/BPQY", tags: ["SSDI", "Missing"], linked: "SSDI-to-SC mapping" },
  { name: "Needed: aortic surgery records", tags: ["Surgery", "Missing"], linked: "Residual timeline" },
];

function statusColor(s: string) {
  const map: Record<string, string> = {
    Complete: "#267a56", Verified: "#267a56", Active: "#267a56", Confirmed: "#267a56", Authorized: "#267a56",
    Missing: "#b6504c", Red: "#b6504c", Insufficient: "#b6504c",
    Unconfirmed: "#b98922", Yellow: "#b98922", Medium: "#b98922", Investigate: "#b98922", High: "#b98922",
    Mapped: "#3b82f6", Open: "#667184",
  };
  return map[s] || "#667184";
}

function Pill({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: statusColor(label) + "22", color: statusColor(label), border: `1px solid ${statusColor(label)}44`, whiteSpace: "nowrap" as const }}>
      {label}
    </span>
  );
}

function Card({ title, sub, children, badge }: { title: string; sub?: string; children: React.ReactNode; badge?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #d9dfd5", borderRadius: 10, padding: "18px 20px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h2>
          {sub && <p style={{ margin: "3px 0 0", color: "#667184", fontSize: 12 }}>{sub}</p>}
        </div>
        {badge && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid #d9dfd5", color: "#667184", whiteSpace: "nowrap" as const, marginLeft: 8 }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

type Doc = { id: string; category: string; file_name: string; status: string; };
type Profile = { display_name?: string | null; branch?: string | null; state?: string | null; current_rating?: string | null; work_status?: string | null; dependent_status?: string | null; } | null;

export function VeteranDashboard({ profile, userEmail, documents = [] }: { profile: Profile; userEmail: string; documents?: Doc[] }) {
  const [selectedCat, setSelectedCat] = useState("Schedular Review");
  const [understanding, setUnderstanding] = useState([true, true, true, false, false, false]);
  const [protocol, setProtocol] = useState([true, true, false, false]);
  const [briefCopied, setBriefCopied] = useState(false);

  const branch = profile?.branch || "Air Force";
  const state = profile?.state || "Florida";
  const rating = profile?.current_rating || "90%";
  const cat = categories.find((c) => c.name === selectedCat) || categories[0];

  // Build live evidence inventory from real uploaded documents
  const uploadedCategories = new Set(documents.map((d) => d.category));
  const liveEvidenceInventory = evidenceConfig.map((item) => ({
    ...item,
    status: uploadedCategories.has(item.docCategory) ? "Complete" : "Missing",
  }));

  const completedCount = liveEvidenceInventory.filter((i) => i.status === "Complete").length;
  const totalCount = liveEvidenceInventory.length;

  function copyBrief() {
    const text = briefSections.map((s) => `${s.title}\n${s.points.map((p) => `- ${p}`).join("\n")}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
    setBriefCopied(true);
    setTimeout(() => setBriefCopied(false), 3000);
  }

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>

      {/* AI Advisor */}
      <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "13px 16px", marginBottom: 12, display: "flex", gap: 10 }}>
        <span style={{ color: "#4ade80", fontWeight: 800, fontSize: 13, marginTop: 1 }}>AI</span>
        <p style={{ margin: 0, fontSize: 13, color: "#c6d3dc", lineHeight: 1.5 }}>
          For your {branch} veteran, {state} resident, {rating} service-connected veteran profile, start with schedular review opportunities. Current strategy favors schedular evidence review over TDIU so future work and consulting options stay open.
        </p>
      </div>

      {/* Goal Test */}
      <Card title="Can this beat a folder full of PDFs?" sub="The client should leave with a clearer story, not just a better file cabinet.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[{ label: "Known now", value: "18", title: "Verified facts extracted", text: "Service, rating, award, P&T status, FMP, federal preference, and VA loan details visible without opening each PDF." },
            { label: "Translated", value: "4", title: "Documents explained", text: "The app explains what each key letter says and why it matters to benefits, claims research, or next actions." },
            { label: "Unblocked", value: "6", title: "Benefit lanes organized", text: "Federal, Florida, FMP/Health, Owner/Buyer, Schedular Review, and No Dependents separated into clear lanes." },
            { label: "Still open", value: "2", title: "Critical gaps named", text: "Individual rating breakdown and SSDI-to-service-connected condition mapping remain the biggest unanswered questions." }].map((item) => (
            <div key={item.label} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>{item.label}</span>
              <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.1, margin: "3px 0" }}>{item.value}</div>
              <strong style={{ fontSize: 13 }}>{item.title}</strong>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667184" }}>{item.text}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div><h3 style={{ margin: 0, fontSize: 15 }}>Understanding Check</h3><p style={{ margin: "2px 0 0", fontSize: 12, color: "#667184" }}>If the client can answer these without reopening the PDF folder, the navigator is doing real work.</p></div>
          <div style={{ fontSize: 24, fontWeight: 900, color: understanding.filter(Boolean).length === 6 ? "#267a56" : "#172132", textAlign: "center" as const, minWidth: 60 }}>{understanding.filter(Boolean).length}/6<div style={{ fontSize: 10, fontWeight: 400, color: "#667184" }}>answered</div></div>
        </div>
        {["Can I state my verified service, current VA status, and P&T status?", "Can I explain what each uploaded VA letter proves?", "Can I name my current service-connected conditions from the evidence?", "Can I identify which benefits are verified versus conditional?", "Can I name the two biggest missing evidence gaps?", "Can I walk into a VSO conversation with focused questions?"].map((item, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, cursor: "pointer", marginBottom: 5 }}>
            <input type="checkbox" checked={understanding[i]} onChange={() => { const n = [...understanding]; n[i] = !n[i]; setUnderstanding(n); }} />
            <span style={{ fontSize: 13 }}>{item}</span>
          </label>
        ))}
      </Card>

      {/* Knowledge Vault — live evidence inventory */}
      <Card title="Veteran Knowledge Vault" sub="Evidence inventory, document tags, opportunity scores, and life-event context in one place." badge={`${completedCount}/${totalCount} complete`}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Evidence Inventory</h3>
        {liveEvidenceInventory.map((item) => (
          <div key={item.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <div>
              <strong style={{ fontSize: 13 }}>{item.category}</strong>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: "#667184" }}>{item.note}</p>
            </div>
            <Pill label={item.status} />
          </div>
        ))}
        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>Rooms Not Yet Explored</h3>
        {opportunityScores.map((item) => (
          <div key={item.area} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <div><strong style={{ fontSize: 13 }}>{item.area}</strong><p style={{ margin: "1px 0 0", fontSize: 11, color: "#667184" }}>{item.note}</p></div>
            <Pill label={item.opportunity} />
          </div>
        ))}
        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>Document Vault</h3>
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.id} style={{ padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 13 }}>{doc.file_name}</strong>
                <Pill label="Uploaded" />
              </div>
              <small style={{ color: "#667184", fontSize: 11 }}>Category: {doc.category}</small>
            </div>
          ))
        ) : (
          vaultDocuments.map((doc) => (
            <div key={doc.name} style={{ padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
              <strong style={{ fontSize: 13 }}>{doc.name}</strong>
              <div style={{ display: "flex", gap: 4, margin: "3px 0" }}>{doc.tags.map((t) => <span key={t} style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "#f4f6f3", color: "#267a56", fontWeight: 600 }}>{t}</span>)}</div>
              <small style={{ color: "#667184", fontSize: 11 }}>Linked to: {doc.linked}</small>
            </div>
          ))
        )}
        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>Life Events Timeline Engine</h3>
        {lifeEvents.map((event) => (
          <div key={event.when} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#b98922", minWidth: 65 }}>{event.when}</span>
            <div style={{ flex: 1 }}><strong style={{ fontSize: 13 }}>{event.title}</strong><p style={{ margin: "1px 0 0", fontSize: 11, color: "#667184" }}>{event.detail}</p></div>
            <Pill label={event.status} />
          </div>
        ))}
      </Card>

      {/* 90-to-100 Workbench */}
      <Card title="90-to-100 Workbench" sub="Research paths that preserve future work options." badge="Possibilities, not entitlement claims">
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Why schedular first?</h3>
        {schedularStrategies.map((item) => (
          <div key={item.title} style={{ padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <strong style={{ fontSize: 13 }}>{item.title}</strong>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667184" }}>{item.text}</p>
          </div>
        ))}
        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>Evidence Matrix</h3>
        {conditionMatrix.map((row) => (
          <div key={row.condition} style={{ padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ color: "#267a56", fontSize: 13 }}>{row.condition}</strong>
              <Pill label={row.ready} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
              <span style={{ fontSize: 11, color: "#667184" }}>VA SC: {row.va}</span>
              <span style={{ fontSize: 11, color: "#667184" }}>SSDI: {row.ssdi}</span>
              <span style={{ fontSize: 11, color: "#667184" }}>Rating: {row.rating}</span>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#667184" }}>Last exam: {row.lastExam} · Worsening: {row.worsening}</p>
          </div>
        ))}
        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>SSDI Mapping</h3>
        {["What conditions are listed on the SSDI award or BPQY?", "Which SSDI conditions match the FMP service-connected list?", "Which conditions affect work but are not yet VA service-connected?", "Which evidence supports schedular increase rather than TDIU?"].map((item, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, cursor: "pointer", marginBottom: 5 }}>
            <input type="checkbox" />
            <span style={{ fontSize: 13 }}>{item}</span>
          </label>
        ))}
      </Card>

      {/* Opportunity Map */}
      <Card title="Opportunity Map" sub="AI-ranked benefits, resources, discounts, grants, and services by eligibility strength.">
        <div style={{ marginBottom: 12 }}>
          {categories.map((c) => (
            <button key={c.name} onClick={() => setSelectedCat(c.name)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "11px 13px", border: `2px solid ${selectedCat === c.name ? "#267a56" : "#d9dfd5"}`, borderRadius: 8, background: selectedCat === c.name ? "#dff3e7" : "#fff", cursor: "pointer", textAlign: "left" as const, marginBottom: 5 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 12, color: "#267a56", minWidth: 24 }}>{c.initials}</span>
                <div><strong style={{ fontSize: 14 }}>{c.name}</strong><p style={{ margin: "1px 0 0", fontSize: 11, color: "#667184" }}>{c.items[0]}</p></div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: statusColor(c.value) }}>{c.value}</div>
                <span style={{ fontSize: 10, color: "#667184" }}>{c.count} matches</span>
              </div>
            </button>
          ))}
        </div>
        {cat && (
          <div style={{ padding: "12px 14px", border: "1px solid #267a56", borderRadius: 8, background: "#f4fbf7" }}>
            <strong style={{ fontSize: 14 }}>{cat.name} — Best next check</strong>
            <p style={{ margin: "3px 0 6px", fontSize: 13 }}>{cat.items[0]}</p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>{cat.items.slice(1).map((item) => <li key={item} style={{ fontSize: 12, color: "#667184", marginBottom: 3 }}>{item}</li>)}</ul>
            <small style={{ color: "#267a56", fontWeight: 600, fontSize: 11 }}>Source: {cat.source}</small>
          </div>
        )}
      </Card>

      {/* Readiness Score */}
      <Card title="Readiness Score" sub="Service, preference, FMP, benefit-summary, and home-loan documents are present. Schedular evidence and exact rating breakdown remain the main gaps.">
        <div style={{ textAlign: "center" as const, marginBottom: 14 }}>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>94</div>
          <div style={{ fontSize: 12, color: "#667184" }}>ready</div>
        </div>
        {[{ label: "Known likely", value: 18 }, { label: "High-priority review", value: 4 }, { label: "Needs answers", value: 2 }].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <span style={{ fontSize: 13 }}>{item.label}</span><strong>{item.value}</strong>
          </div>
        ))}
        <div style={{ marginTop: 10, padding: "11px 13px", border: "1px solid #b98922", borderRadius: 8, background: "#fbefd0" }}>
          <strong style={{ fontSize: 12, color: "#b98922" }}>⚠ Evidence map improved</strong>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#b98922" }}>Use the FMP condition list and SSDI basis to map schedular evidence, worsening, and residuals.</p>
        </div>
      </Card>

      {/* Next Best Actions */}
      <Card title="Next Best Actions" sub="Ordered by impact, urgency, and missing evidence.">
        {actions.map((action) => (
          <div key={action.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <div style={{ flex: 1, paddingRight: 10 }}><strong style={{ fontSize: 13 }}>{action.title}</strong><p style={{ margin: "2px 0 0", fontSize: 11, color: "#667184" }}>{action.meta}</p></div>
            <Pill label={action.priority} />
          </div>
        ))}
      </Card>

      {/* Veteran Journey Map */}
      <Card title="Veteran Journey Map" sub="Turns VA letters into a chronological, source-backed story." badge={`${journeyItems.length} documents translated`}>
        {journeyItems.map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 13px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <Pill label={item.status} />
            <div><span style={{ fontSize: 11, fontWeight: 700, color: "#b98922" }}>{item.date}</span><strong style={{ display: "block", fontSize: 14 }}>{item.title}</strong><p style={{ margin: "2px 0 0", fontSize: 12, color: "#667184" }}>{item.text}</p></div>
          </div>
        ))}
      </Card>

      {/* Portable Journey Brief */}
      <Card title="Portable Journey Brief" sub="A one-page conversation starter for the veteran, VSO, attorney, lender, or benefits counselor.">
        {briefSections.map((section) => (
          <div key={section.title} style={{ padding: "11px 13px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 8 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>{section.title}</h3>
            <ul style={{ margin: 0, paddingLeft: 16 }}>{section.points.map((p) => <li key={p} style={{ fontSize: 12, color: "#667184", marginBottom: 3 }}>{p}</li>)}</ul>
          </div>
        ))}
        <button onClick={copyBrief} style={{ width: "100%", minHeight: 40, borderRadius: 8, border: "1px solid #d9dfd5", background: briefCopied ? "#dff3e7" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: briefCopied ? "#267a56" : "#172132" }}>
          {briefCopied ? "✓ Brief copied for VSO conversation" : "Copy brief →"}
        </button>
      </Card>

      {/* Client Validation Protocol */}
      <Card title="Client Validation Protocol" sub="Run this with the veteran to prove whether the navigator improves understanding versus the PDF folder baseline." badge={`${protocol.filter(Boolean).length}/4 steps`}>
        {[{ phase: "1. PDF Baseline", task: "Give the client the original PDF folder and ask six journey questions.", measure: "Record how many they can answer in 10 minutes without coaching." },
          { phase: "2. Navigator Pass", task: "Let the client use this dashboard, journey map, translator, and brief.", measure: "Record the same six answers using the Understanding Check." },
          { phase: "3. Conversation Test", task: "Ask the client to explain their story and top VSO questions out loud.", measure: "Pass if they can name verified facts, open gaps, and next actions." },
          { phase: "4. Decision", task: "Compare baseline confidence with navigator confidence.", measure: "Keep building only if understanding, confidence, or action clarity improves." }].map((step, i) => (
          <div key={step.phase} style={{ padding: "11px 13px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>{step.phase}</span>
            <strong style={{ display: "block", fontSize: 13, margin: "3px 0" }}>{step.task}</strong>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: "#667184" }}>{step.measure}</p>
            <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <input type="checkbox" checked={protocol[i]} onChange={() => { const n = [...protocol]; n[i] = !n[i]; setProtocol(n); }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Evidence collected</span>
            </label>
          </div>
        ))}
      </Card>

      {/* Referral Network */}
      <Card title="Referral Network" sub="Legal, VSO, nonprofit, healthcare, housing, and education partners.">
        {[{ label: "VSO Claim Review", sub: "No-cost advocate", badge: "2 openings", color: "#267a56" },
          { label: "Accredited Attorney", sub: "Appeals + denials", badge: "48 hr reply", color: "#b98922" },
          { label: "Housing Navigator", sub: "Local county partner", badge: "Same week", color: "#b98922" }].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <div><strong style={{ fontSize: 14 }}>{item.label}</strong><p style={{ margin: "2px 0 0", fontSize: 12, color: "#667184" }}>{item.sub}</p></div>
            <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.badge}</span>
          </div>
        ))}
      </Card>

    </div>
  );
}
