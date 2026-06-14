const categories = [
  {
    name: "Federal",
    initials: "FE",
    color: "green",
    count: 10,
    value: "Confirmed",
    items: ["30%+ civil-service preference proof", "No-cost VA health care and prescriptions", "VR&E eligibility screen"],
    source: "Civil service letter / VA matrix"
  },
  {
    name: "Florida",
    initials: "FL",
    color: "gold",
    count: 9,
    value: "Unlocked",
    items: ["Free lifetime state park pass", "FDVA/CVSO benefits counseling", "P&T-only tax/ID benefits currently conditional"],
    source: "FDVA / Florida State Parks"
  },
  {
    name: "Commissary",
    initials: "CX",
    color: "teal",
    count: 3,
    value: "Likely",
    items: ["Commissary access", "Exchange access", "MWR retail facility access"],
    source: "VA News / DoD access"
  },
  {
    name: "Education",
    initials: "ED",
    color: "blue",
    count: 4,
    value: "Check",
    items: ["Florida tuition waiver check", "Priority registration if using GI Bill", "VR&E education or training path"],
    source: "FDVA education"
  },
  {
    name: "Owner/Buyer",
    initials: "HO",
    color: "red",
    count: 7,
    value: "Strong",
    items: ["VA funding-fee exemption confirmed", "Prior entitlement charged: $87,575", "Restoration or remaining-entitlement strategy"],
    source: "VA COE / FDVA housing"
  },
  {
    name: "FMP/Health",
    initials: "FM",
    color: "green",
    count: 9,
    value: "Authorized",
    items: ["Foreign Medical Program for SC conditions", "Condition list captured", "Travel reimbursement check"],
    source: "FMP authorization / VA matrix"
  },
  {
    name: "Schedular Review",
    initials: "SR",
    color: "gold",
    count: 8,
    value: "High",
    items: ["90-to-100 evidence matrix", "Map SSDI basis to SC conditions", "Need individual rating breakdown"],
    source: "VA rating evidence review"
  },
  {
    name: "No Dependents",
    initials: "FA",
    color: "teal",
    count: 1,
    value: "Closed",
    items: ["No spouse/dependent add-on", "Skip spouse Aid and Attendance", "Skip dependent scholarship unless status changes"],
    source: "VA compensation rates"
  }
];

const demoUsers = {
  mark: {
    id: "mark",
    name: "Mark Chambers",
    shortName: "Mark",
    branch: "Air Force",
    state: "Florida",
    rating: "90%",
    answersNeeded: "2",
    service: "Honorable",
    serviceDates: "Aug. 20, 1985 to May 24, 1988",
    work: "Unemployed + SSDI",
    dependents: "None",
    pt: "No",
    monthlyAward: "$2,362.30",
    vaLoan: "Funding-fee exempt",
    federalPreference: "30%+",
    fmp: "Authorized",
    profileSummary: "Air Force veteran, Florida resident, 90% service-connected",
    profileDescription: "Honorable service from Aug. 20, 1985 to May 24, 1988. No spouse or dependents. Unemployed and on SSDI. Benefit summary confirms not permanent and total. COE confirms VA loan eligibility and funding-fee exemption."
  },
  demo_air_force: {
    id: "demo_air_force",
    name: "Test Veteran 2",
    shortName: "Veteran 2",
    branch: "Air Force",
    state: "Georgia",
    rating: "70%",
    answersNeeded: "5",
    service: "Honorable",
    serviceDates: "Needed",
    work: "Working",
    dependents: "One dependent",
    pt: "Unknown",
    monthlyAward: "Needed",
    vaLoan: "Not uploaded",
    federalPreference: "Check",
    fmp: "Unknown",
    profileSummary: "Air Force veteran, Georgia resident, profile in intake",
    profileDescription: "This test profile starts mostly empty so a second veteran can experience onboarding, missing-document upload, and voice-to-text intake without seeing Mark's saved notes."
  },
  demo_army: {
    id: "demo_army",
    name: "Test Veteran 3",
    shortName: "Veteran 3",
    branch: "Army",
    state: "Florida",
    rating: "50%",
    answersNeeded: "6",
    service: "Needed",
    serviceDates: "Needed",
    work: "Self-employed",
    dependents: "Unknown",
    pt: "Unknown",
    monthlyAward: "Needed",
    vaLoan: "Check",
    federalPreference: "Check",
    fmp: "Unknown",
    profileSummary: "Army veteran, Florida resident, new workspace",
    profileDescription: "This test profile demonstrates a separate veteran workspace with its own upload queue, voice notes, evidence gaps, and meeting packet preparation."
  }
};

const actions = [
  { title: "Build schedular 90-to-100 evidence matrix", meta: "Preserves future work options while reviewing increases, secondaries, and residuals", priority: "High" },
  { title: "Map SSDI basis to service-connected conditions", meta: "Use SSA evidence to understand overlap, not to force a TDIU posture", priority: "Today" },
  { title: "Retrieve individual rating breakdown when VA access returns", meta: "Needed to see which conditions, diagnostic codes, and last exams may warrant review", priority: "Next" },
  { title: "Plan next VA-backed home purchase", meta: "COE confirms funding-fee exemption and $87,575 prior entitlement charged; check restoration or remaining entitlement", priority: "Open" },
  { title: "Use civil-service letter for federal applications", meta: "Document verifies honorable separation and 30%+ service-connected disability compensation", priority: "Open" },
  { title: "Claim Florida free lifetime state park pass", meta: "Service-connected veterans can qualify with proof of status and honorable discharge", priority: "Open" }
];

const scannerItems = [
  {
    title: "Schedular 90-to-100 path",
    status: "Review",
    text: "Preserves future work and consulting options. Needs individual ratings, worsening evidence, and secondary/residual theories."
  },
  {
    title: "Secondary conditions",
    status: "Research",
    text: "Use spine, radiculopathy, sleep apnea, depression, knee, tinnitus, and skin conditions as the starting map."
  },
  {
    title: "Post-surgical residuals",
    status: "Investigate",
    text: "Aortic surgery, aneurysm history, dialysis episode, numbness, scars, and follow-up care should be organized for VSO review."
  }
];

const evidenceItems = [
  {
    label: "Ready",
    tone: "green",
    title: "Service, rating, COE, FMP, civil preference",
    text: "Core documents are captured and can support benefit verification."
  },
  {
    label: "Needs evidence",
    tone: "yellow",
    title: "Schedular increase map",
    text: "Need individual ratings, last exam dates, worsening evidence, and functional impact statements."
  },
  {
    label: "Insufficient",
    tone: "red",
    title: "Surgery residual claim theory",
    text: "Need medical records, diagnosis links, chronology, nexus theory, and accredited review."
  }
];

const journeyItems = [
  {
    date: "Aug 1985 - May 1988",
    title: "Air Force service",
    status: "Verified",
    text: "VA service verification confirms honorable Air Force service for this period."
  },
  {
    date: "Apr 1, 2026",
    title: "Current award status",
    status: "Verified",
    text: "Benefit summary shows 90% combined service-connected evaluation, monthly award, and not P&T."
  },
  {
    date: "Mar 31, 2026",
    title: "Home loan eligibility",
    status: "Verified",
    text: "COE confirms Chapter 37 eligibility, funding-fee exemption, and prior entitlement charged."
  },
  {
    date: "Jun 14, 2026",
    title: "Evidence packet grows",
    status: "Mapped",
    text: "Civil-service preference, proof of service, FMP authorization, and benefit summary now support separate benefit lanes."
  },
  {
    date: "Next",
    title: "Claim research questions",
    status: "Open",
    text: "Individual ratings, SSDI basis, employment history, surgery residual records, and provider notes are still needed."
  }
];

const documentItems = [
  {
    name: "Benefit summary",
    says: "90% combined, monthly award, not P&T.",
    matters: "Anchors current VA status and separates verified benefits from conditional P&T-only benefits."
  },
  {
    name: "FMP authorization",
    says: "Lists VA-adjudicated service-connected conditions.",
    matters: "Creates the condition map for health care abroad, secondary-condition research, and schedular evidence review."
  },
  {
    name: "Home-loan COE",
    says: "VA loan eligible, funding-fee exempt, prior entitlement charged.",
    matters: "Turns home buying from a vague goal into entitlement restoration and remaining-entitlement questions."
  },
  {
    name: "Civil-service letter",
    says: "Honorable separation and 30%+ service-connected compensation.",
    matters: "Supports federal hiring preference and confirms a benefit lane outside claims."
  }
];

const clarityItems = [
  {
    label: "Known now",
    value: "18",
    title: "Verified facts extracted",
    text: "Service, rating, award, P&T status, FMP, federal preference, and VA loan details are visible without opening each PDF."
  },
  {
    label: "Translated",
    value: "4",
    title: "Documents explained",
    text: "The app explains what each key letter says and why it matters to benefits, claims research, or next actions."
  },
  {
    label: "Unblocked",
    value: "6",
    title: "Benefit lanes organized",
    text: "Federal, Florida, FMP/Health, Owner/Buyer, Schedular Review, and No Dependents are separated into clear lanes."
  },
  {
    label: "Still open",
    value: "2",
    title: "Critical gaps named",
    text: "Individual rating breakdown and SSDI-to-service-connected condition mapping remain the biggest unanswered questions."
  }
];

const understandingItems = [
  "Can I state my verified service, current VA status, and P&T status?",
  "Can I explain what each uploaded VA letter proves?",
  "Can I name my current service-connected conditions from the evidence?",
  "Can I identify which benefits are verified versus conditional?",
  "Can I name the two biggest missing evidence gaps?",
  "Can I walk into a VSO conversation with focused questions?"
];

const evidenceInventory = [
  { category: "Service Records", status: "Complete", note: "Service verification and proof of honorable service captured." },
  { category: "VA Letters", status: "Complete", note: "Benefit summary, FMP, civil-service, and COE letters captured." },
  { category: "Rating Decisions", status: "Missing", note: "Need full decision with individual ratings, diagnostic codes, and reasons." },
  { category: "SSDI Records", status: "Missing", note: "Need award letter or BPQY showing SSA-recognized conditions." },
  { category: "Surgical Records", status: "Missing", note: "Need aortic surgery, dialysis episode, follow-up care, and residual notes." },
  { category: "Medication List", status: "Missing", note: "Needed for current treatment profile and functional impact." },
  { category: "Employment Timeline", status: "Missing", note: "Needed to understand work limits and timeline context." },
  { category: "Personal Statement Timeline", status: "Missing", note: "Needed to explain symptoms, changes, and daily limitations." }
];

const opportunityScores = [
  { area: "State Benefits", opportunity: "High", note: "Florida benefits and county-level savings should be investigated." },
  { area: "Home Loan Entitlement Review", opportunity: "Medium", note: "COE confirms funding-fee exemption and prior entitlement charged." },
  { area: "Florida Property Tax", opportunity: "Medium", note: "Worth investigating as homeowner; P&T-only items remain conditional." },
  { area: "Schedular Increase Review", opportunity: "High", note: "Preferred personal path because it preserves future work and consulting options." },
  { area: "VR&E", opportunity: "Medium", note: "Explore if education, training, or independent-living support is useful." },
  { area: "Foreign Medical Program", opportunity: "Active", note: "Authorization is verified for service-connected conditions abroad." },
  { area: "Federal Employment Preference", opportunity: "Active", note: "Civil-service letter verifies 30%+ preference support." },
  { area: "Post-Surgical Residual Review", opportunity: "Investigate", note: "Aortic surgery, dialysis, numbness, scars, and monitoring need chronology." }
];

const schedularStrategies = [
  { title: "No work restriction", text: "Schedular 100% does not require remaining unable to work; it better fits a future consulting/CES path." },
  { title: "VA combined math needs evidence", text: "At 90%, the app needs individual ratings and new/worsened conditions to identify realistic paths." },
  { title: "Best review lanes", text: "Post-surgical residuals, secondaries, worsening of current SC conditions, and updated exams." }
];

const conditionMatrix = [
  { condition: "Sleep apnea", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Yellow" },
  { condition: "Depression", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Yellow" },
  { condition: "Lumbar spine", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Red" },
  { condition: "Radiculopathy", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Red" },
  { condition: "Aortic residuals", va: "Unknown", ssdi: "Unknown", rating: "N/A", lastExam: "Recent", worsening: "Investigate", ready: "Red" }
];

const ssdiMapItems = [
  "What conditions are listed on the SSDI award or BPQY?",
  "Which SSDI conditions match the FMP service-connected list?",
  "Which conditions affect work but are not yet VA service-connected?",
  "Which evidence supports schedular increase rather than TDIU?"
];

const ssdiAssistSteps = [
  { title: "Before applying", text: "Gather VA decisions, C&P exams, private records, hospital records, and a 15-year work history." },
  { title: "Apply or retrieve records", text: "Use SSA.gov or request BPQY/award documentation to identify the medical basis." },
  { title: "After applying", text: "Track deadlines, respond to requests, and preserve evidence for VA and SSA as separate systems." }
];

const graphTabs = [
  { id: "links", label: "Document links" },
  { id: "score", label: "Evidence score" },
  { id: "changed", label: "What changed?" },
  { id: "packet", label: "Meeting packet" },
  { id: "mapper", label: "SSDI mapper" }
];

const graphDocuments = [
  { id: 1, name: "benefit_summary.pdf", tags: ["VA Decision"], verified: true, linkedConditions: [], linkedEvents: ["VA rating - 90% SC"], notes: "90% combined, $2,362.30/mo, not P&T." },
  { id: 2, name: "certificate_of_eligibility_home_loan.pdf", tags: ["VA Decision", "Housing"], verified: true, linkedConditions: [], linkedEvents: ["VA home loan COE"], notes: "Chapter 37 eligible, funding-fee exempt, $87,575 prior entitlement charged." },
  { id: 3, name: "service_verification.pdf", tags: ["Service"], verified: true, linkedConditions: [], linkedEvents: ["Air Force service"], notes: "Confirms honorable Air Force service Aug. 20, 1985 to May 24, 1988." },
  { id: 4, name: "proof_of_service.pdf", tags: ["Service"], verified: true, linkedConditions: [], linkedEvents: ["Air Force service"], notes: "Proof of honorable service document." },
  { id: 5, name: "foreign_medical_program.pdf", tags: ["Medical", "VA Decision"], verified: true, linkedConditions: ["Sleep apnea", "Depression", "Lumbar spine", "Radiculopathy", "Tinnitus", "Knee condition", "Skin condition"], linkedEvents: ["VA rating - 90% SC"], notes: "FMP authorized and lists VA-adjudicated service-connected conditions." },
  { id: 6, name: "civil_service.pdf", tags: ["Employment"], verified: true, linkedConditions: [], linkedEvents: ["Federal preference"], notes: "30%+ SC preference confirmed for federal hiring lane." },
  { id: 7, name: "Needed: SSDI award/BPQY", tags: ["SSDI", "Missing"], verified: false, linkedConditions: ["Sleep apnea", "Depression", "Lumbar spine", "Radiculopathy"], linkedEvents: ["Employment impact"], notes: "Needed to confirm the SSA-recognized medical basis." },
  { id: 8, name: "Needed: aortic surgery records", tags: ["Surgery", "Missing"], verified: false, linkedConditions: ["Aortic / vascular residuals"], linkedEvents: ["Major aortic surgery", "Dialysis episode", "Residual numbness"], notes: "Needed for operative chronology, follow-up care, scars, dialysis, and residual symptoms." }
];

const graphConditions = [
  {
    id: 1,
    name: "Sleep apnea",
    category: "Respiratory",
    vaSC: true,
    ssdi: true,
    evidenceItems: [
      { label: "Diagnosis documented", done: true },
      { label: "CPAP prescription on file", done: true },
      { label: "Recent treatment records within 12 months", done: false },
      { label: "Current symptom statement", done: false },
      { label: "Functional impact documented", done: false }
    ],
    notes: "CPAP prescribed. Need current functional impact when sleep is disrupted.",
    whatChangedPrompts: ["CPAP tolerance or failures", "Daytime fatigue", "Work or concentration impact"]
  },
  {
    id: 2,
    name: "Depression",
    category: "Mental health",
    vaSC: true,
    ssdi: true,
    evidenceItems: [
      { label: "Diagnosis documented", done: true },
      { label: "Treatment history", done: false },
      { label: "Secondary nexus to pain or sleep documented", done: false },
      { label: "Current symptom statement", done: false },
      { label: "Functional impact on daily life", done: false }
    ],
    notes: "Potentially connected to chronic pain and sleep disruption; needs provider records.",
    whatChangedPrompts: ["Mood changes", "Sleep and pain interaction", "Social or work impairment"]
  },
  {
    id: 3,
    name: "Lumbar spine",
    category: "Musculoskeletal",
    vaSC: true,
    ssdi: true,
    evidenceItems: [
      { label: "Original diagnosis on file", done: true },
      { label: "Recent imaging", done: false },
      { label: "Range of motion documented", done: false },
      { label: "Current treatment records", done: false },
      { label: "Functional limitation statement", done: false }
    ],
    notes: "Needs recent imaging, range-of-motion evidence, and daily limitation details.",
    whatChangedPrompts: ["Mobility loss", "Flare frequency", "Sitting, standing, lifting limits"]
  },
  {
    id: 4,
    name: "Radiculopathy",
    category: "Neurological",
    vaSC: true,
    ssdi: true,
    evidenceItems: [
      { label: "Diagnosis documented", done: true },
      { label: "Nexus to lumbar spine documented", done: false },
      { label: "Nerve study or neurological exam", done: false },
      { label: "Symptom frequency and severity statement", done: false }
    ],
    notes: "Likely tied to lumbar spine, but severity and laterality need stronger documentation.",
    whatChangedPrompts: ["Numbness pattern", "Pain radiation", "Falls, weakness, or foot symptoms"]
  },
  {
    id: 5,
    name: "Aortic / vascular residuals",
    category: "Cardiovascular",
    vaSC: false,
    ssdi: false,
    evidenceItems: [
      { label: "Operative records for aortic surgery", done: false },
      { label: "Dialysis episode records", done: false },
      { label: "Post-surgical follow-up records", done: false },
      { label: "Residual numbness documented by provider", done: false },
      { label: "Scar documentation", done: false },
      { label: "Nexus theory reviewed by accredited help", done: false }
    ],
    notes: "Major unexplored lane. Needs records before anyone can responsibly assess a theory.",
    whatChangedPrompts: ["Surgery recovery", "Dialysis duration", "Residual numbness, scars, monitoring"]
  }
];

const graphEvents = [
  { year: "1985-1988", label: "Air Force service", verified: true },
  { year: "Apr 2026", label: "VA rating - 90% SC", verified: true },
  { year: "Unknown", label: "Sleep apnea onset / CPAP", verified: false },
  { year: "~2007", label: "Aortic event - initial diagnosis", verified: false },
  { year: "2025", label: "Major aortic surgery", verified: false },
  { year: "2025", label: "Dialysis episode", verified: false },
  { year: "2025-now", label: "Residual numbness and monitoring", verified: false },
  { year: "Mar 2026", label: "VA home loan COE", verified: true }
];

const ssdiApplicationPhases = [
  {
    phase: "Before you apply",
    steps: [
      { title: "Gather medical evidence", detail: "Collect VA decisions, C&P exams, private records, hospital records, and records for every limiting condition.", status: "Required" },
      { title: "Build work history", detail: "SSA needs jobs from the last 15 years: title, duties, dates, hours, and pay.", status: "Required" },
      { title: "Choose onset date carefully", detail: "The date conditions prevented work affects back pay and should be tied to records where possible.", status: "Important" }
    ]
  },
  {
    phase: "Applying",
    steps: [
      { title: "Apply online or request records", detail: "Use SSA.gov for applications, or retrieve award/BPQY records to identify the medical basis of an existing award.", status: "Start here" },
      { title: "List every limiting condition", detail: "SSA evaluates combined functional impact. Do not list only one condition if several limit work.", status: "Important" },
      { title: "Request veteran-aware handling", detail: "Ask whether any veteran expedited handling applies and document who you spoke with.", status: "Ask" }
    ]
  },
  {
    phase: "After you apply",
    steps: [
      { title: "Track all SSA requests", detail: "Missed forms, consultative exams, or deadlines can derail the application.", status: "Important" },
      { title: "Prepare for appeal paths", detail: "Many first applications are denied. Keep records organized for reconsideration or hearing review.", status: "Know this" },
      { title: "Keep VA and SSA separate", detail: "SSDI and VA compensation are separate programs; evidence may overlap, but rules differ.", status: "Note" }
    ]
  }
];

const intakeUploadTargets = [
  {
    id: "rating-decision",
    title: "Full VA rating decision",
    category: "Rating Decisions",
    accepts: ".pdf,.png,.jpg,.jpeg,.doc,.docx",
    linkTo: "Individual ratings, diagnostic codes, reasons, and last exam dates"
  },
  {
    id: "ssdi-records",
    title: "SSDI award letter or BPQY",
    category: "SSDI Records",
    accepts: ".pdf,.png,.jpg,.jpeg,.doc,.docx",
    linkTo: "SSDI-to-service-connected condition mapping"
  },
  {
    id: "surgery-records",
    title: "Aortic surgery and dialysis records",
    category: "Surgical Records",
    accepts: ".pdf,.png,.jpg,.jpeg,.doc,.docx",
    linkTo: "Aortic residuals, dialysis episode, scars, numbness, follow-up care"
  },
  {
    id: "medications",
    title: "Medication list",
    category: "Medication List",
    accepts: ".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt",
    linkTo: "Current treatment profile and functional impact"
  },
  {
    id: "employment",
    title: "Employment timeline evidence",
    category: "Employment Timeline",
    accepts: ".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt",
    linkTo: "Work history, SSDI context, future consulting strategy"
  },
  {
    id: "personal-statement",
    title: "Personal statement timeline",
    category: "Personal Statement Timeline",
    accepts: ".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt",
    linkTo: "Symptoms, what changed, daily impact, VSO conversation"
  }
];

const vaultDocuments = [
  { name: "benefit_summary.pdf", tags: ["VA Letter", "Rating"], linked: "Current award status" },
  { name: "foreign_medical_program.pdf", tags: ["Medical", "VA Letter"], linked: "SC condition map" },
  { name: "certificate_of_eligibility_home_loan.pdf", tags: ["Housing", "VA Letter"], linked: "Home loan entitlement" },
  { name: "service_verification.pdf", tags: ["Service"], linked: "Air Force service" },
  { name: "civil_service.pdf", tags: ["Employment"], linked: "Federal preference" },
  { name: "Needed: SSDI award/BPQY", tags: ["SSDI", "Missing"], linked: "SSDI-to-SC mapping" },
  { name: "Needed: aortic surgery records", tags: ["Surgery", "Missing"], linked: "Residual timeline" }
];

const lifeEvents = [
  { when: "1985-1988", title: "Air Force service", status: "Verified", detail: "Service records verify honorable Air Force service." },
  { when: "~2007", title: "Aortic aneurysm history", status: "Unconfirmed", detail: "Exact event, records, facility, and diagnosis timeline needed." },
  { when: "2023", title: "Emergency hospitalization", status: "Unconfirmed", detail: "Hospital records and discharge summary needed." },
  { when: "2025", title: "Major aortic surgery", status: "Unconfirmed", detail: "Operative report, surgeon notes, and follow-up plan needed." },
  { when: "2025", title: "Dialysis episode", status: "Unconfirmed", detail: "Duration, cause, facility, and relation to surgery need documentation." },
  { when: "2025-now", title: "Residual numbness and monitoring", status: "Investigate", detail: "Provider notes, neuro findings, scar documentation, and current limitations needed." },
  { when: "2026", title: "Current VA/FMP evidence", status: "Verified", detail: "VA letters verify rating status, FMP condition list, preference, and loan eligibility." }
];

const briefSections = [
  {
    title: "Verified story",
    points: [
      "Air Force service verified as honorable from Aug. 20, 1985 to May 24, 1988.",
      "Benefit summary verifies 90% combined service-connected evaluation and not P&T.",
      "FMP authorization lists VA-adjudicated service-connected conditions."
    ]
  },
  {
    title: "Benefits already supported",
    points: [
      "VA compensation and monthly award are verified.",
      "VA home loan eligibility and funding-fee exemption are verified.",
      "Federal civil-service preference support is verified at 30%+ service-connected compensation."
    ]
  },
  {
    title: "Open questions",
    points: [
      "Individual ratings and diagnostic codes are still needed.",
      "SSDI basis must be mapped to service-connected conditions.",
      "Surgery residuals need medical chronology and accredited review."
    ]
  },
  {
    title: "Next conversation",
    points: [
      "Ask a VSO which schedular increase or secondary-condition lanes are most evidence-ready.",
      "Ask what records best document worsening, residuals, and current functional limits.",
      "Ask how prior VA loan entitlement affects another home purchase."
    ]
  }
];

const protocolSteps = [
  {
    phase: "1. PDF baseline",
    task: "Give the client the original PDF folder and ask six journey questions.",
    measure: "Record how many they can answer in 10 minutes without coaching."
  },
  {
    phase: "2. Navigator pass",
    task: "Let the client use this dashboard, journey map, translator, and brief.",
    measure: "Record the same six answers using the Understanding Check."
  },
  {
    phase: "3. Conversation test",
    task: "Ask the client to explain their story and top VSO questions out loud.",
    measure: "Pass if they can name verified facts, open gaps, and next actions."
  },
  {
    phase: "4. Decision",
    task: "Compare baseline confidence with navigator confidence.",
    measure: "Keep building only if understanding, confidence, or action clarity improves."
  }
];

let selectedCategory = "Schedular Review";
let profile = "Veteran";
let activeGraphTab = "links";
let activeChangedConditionId = 1;
let ssdiSelectedConditions = ["Sleep apnea", "Depression", "Lumbar spine", "Radiculopathy"];
let currentUser = null;
let uploadedEvidence = {};
let voiceNotes = [];
let recognition = null;
let isRecording = false;

const authGate = document.querySelector("#authGate");
const appShell = document.querySelector(".appShell");
const accountProvider = document.querySelector("#accountProvider");
const accountName = document.querySelector("#accountName");
const signOutButton = document.querySelector("#signOutButton");
const grid = document.querySelector("#opportunityGrid");
const detail = document.querySelector("#detailStrip");
const actionList = document.querySelector("#actionList");
const queryInput = document.querySelector("#queryInput");
const advisorText = document.querySelector("#advisorText");
const matchCount = document.querySelector("#matchCount");
const ratingStat = document.querySelector("#ratingStat");
const answersNeededStat = document.querySelector("#answersNeededStat");
const testProfileTitle = document.querySelector(".testProfile h2");
const testProfileDescription = document.querySelector(".testProfile p");
const profileFactsEl = document.querySelector(".profileFacts");
const scannerList = document.querySelector("#scannerList");
const evidenceList = document.querySelector("#evidenceList");
const journeyTimeline = document.querySelector("#journeyTimeline");
const documentList = document.querySelector("#documentList");
const clarityGrid = document.querySelector("#clarityGrid");
const understandingList = document.querySelector("#understandingList");
const understandingScore = document.querySelector("#understandingScore");
const evidenceInventoryTable = document.querySelector("#evidenceInventoryTable");
const opportunityScoreList = document.querySelector("#opportunityScoreList");
const vaultDocumentList = document.querySelector("#vaultDocumentList");
const lifeTimelineList = document.querySelector("#lifeTimelineList");
const strategyList = document.querySelector("#strategyList");
const conditionMatrixEl = document.querySelector("#conditionMatrix");
const ssdiChecklist = document.querySelector("#ssdiChecklist");
const ssdiSteps = document.querySelector("#ssdiSteps");
const graphEvidenceScore = document.querySelector("#graphEvidenceScore");
const graphTabsEl = document.querySelector("#graphTabs");
const graphPanel = document.querySelector("#graphPanel");
const intakeSignal = document.querySelector("#intakeSignal");
const uploadQueue = document.querySelector("#uploadQueue");
const voiceSupportStatus = document.querySelector("#voiceSupportStatus");
const voiceStartButton = document.querySelector("#voiceStartButton");
const voiceStopButton = document.querySelector("#voiceStopButton");
const voiceTranscript = document.querySelector("#voiceTranscript");
const voiceTopic = document.querySelector("#voiceTopic");
const saveVoiceNoteButton = document.querySelector("#saveVoiceNoteButton");
const voiceNotesEl = document.querySelector("#voiceNotes");
const briefGrid = document.querySelector("#briefGrid");
const copyBriefButton = document.querySelector("#copyBriefButton");
const copyStatus = document.querySelector("#copyStatus");
const protocolGrid = document.querySelector("#protocolGrid");
const validationResult = document.querySelector("#validationResult");

function renderCategories() {
  grid.innerHTML = categories.map((category) => `
    <button class="opportunityCard ${category.name === selectedCategory ? "selected" : ""}" data-category="${category.name}">
      <div class="categoryIcon ${category.color}">${category.initials}</div>
      <div class="cardTopline">
        <strong>${category.name}</strong>
        <span>${category.count} matches</span>
      </div>
      <div class="cardValue">${category.value}</div>
      <p>${category.items[0]}</p>
      <small class="sourceTag">${category.source}</small>
    </button>
  `).join("");

  document.querySelectorAll(".opportunityCard").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      renderCategories();
      renderDetail();
      updateAdvisor();
    });
  });
}

function renderDetail() {
  const category = categories.find((item) => item.name === selectedCategory);
  detail.innerHTML = `
    <div class="detailIcon ${category.color}">${category.initials}</div>
    <div>
      <span>Best next check</span>
      <strong>${category.items[0]}</strong>
      <small>Source: ${category.source}</small>
    </div>
    <ul>
      ${category.items.slice(1).map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function renderActions() {
  actionList.innerHTML = actions.map((action) => `
    <button class="actionRow">
      <span class="priority">${action.priority}</span>
      <div>
        <strong>${action.title}</strong>
        <small>${action.meta}</small>
      </div>
      <span class="chevron">›</span>
    </button>
  `).join("");
}

function renderClaimCoach() {
  scannerList.innerHTML = scannerItems.map((item) => `
    <div class="scannerRow">
      <span>${item.status}</span>
      <div>
        <strong>${item.title}</strong>
        <small>${item.text}</small>
      </div>
    </div>
  `).join("");

  evidenceList.innerHTML = evidenceItems.map((item) => `
    <div class="evidenceRow ${item.tone}">
      <span>${item.label}</span>
      <div>
        <strong>${item.title}</strong>
        <small>${item.text}</small>
      </div>
    </div>
  `).join("");
}

function renderJourneyMap() {
  journeyTimeline.innerHTML = journeyItems.map((item) => `
    <div class="journeyStep">
      <div class="journeyDot">${item.status}</div>
      <div>
        <span>${item.date}</span>
        <strong>${item.title}</strong>
        <small>${item.text}</small>
      </div>
    </div>
  `).join("");

  documentList.innerHTML = documentItems.map((item) => `
    <div class="documentItem">
      <strong>${item.name}</strong>
      <p><span>Says:</span> ${item.says}</p>
      <p><span>Why it matters:</span> ${item.matters}</p>
    </div>
  `).join("");
}

function renderClarityPanel() {
  clarityGrid.innerHTML = clarityItems.map((item) => `
    <div class="clarityCard">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </div>
  `).join("");
}

function updateUnderstandingScore() {
  const checked = document.querySelectorAll(".understandingItem input:checked").length;
  understandingScore.textContent = `${checked}/${understandingItems.length}`;
  understandingScore.parentElement.classList.toggle("complete", checked === understandingItems.length);
}

function renderUnderstandingCheck() {
  understandingList.innerHTML = understandingItems.map((item, index) => `
    <label class="understandingItem">
      <input type="checkbox" ${index < 3 ? "checked" : ""} />
      <span>${item}</span>
    </label>
  `).join("");

  document.querySelectorAll(".understandingItem input").forEach((input) => {
    input.addEventListener("change", updateUnderstandingScore);
  });
  updateUnderstandingScore();
}

function statusClass(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function workspaceKey(type) {
  return `vjn:${currentUser?.id || "guest"}:${type}`;
}

function loadWorkspaceState() {
  try {
    uploadedEvidence = JSON.parse(localStorage.getItem(workspaceKey("uploads")) || "{}");
    voiceNotes = JSON.parse(localStorage.getItem(workspaceKey("voiceNotes")) || "[]");
  } catch (error) {
    uploadedEvidence = {};
    voiceNotes = [];
  }
}

function saveWorkspaceState() {
  if (!currentUser) return;
  localStorage.setItem(workspaceKey("uploads"), JSON.stringify(uploadedEvidence));
  localStorage.setItem(workspaceKey("voiceNotes"), JSON.stringify(voiceNotes));
}

function renderSignedInProfile(provider = "Prototype sign-in") {
  accountProvider.textContent = provider;
  accountName.textContent = currentUser.name;
  ratingStat.textContent = currentUser.rating;
  answersNeededStat.textContent = currentUser.answersNeeded;
  testProfileTitle.textContent = currentUser.profileSummary;
  testProfileDescription.textContent = currentUser.profileDescription;
  profileFactsEl.innerHTML = [
    `Branch: ${currentUser.branch}`,
    `Rating: ${currentUser.rating}`,
    `Service: ${currentUser.service}`,
    `Service dates: ${currentUser.serviceDates}`,
    `Work: ${currentUser.work}`,
    `State: ${currentUser.state}`,
    `Dependents: ${currentUser.dependents}`,
    `P&T: ${currentUser.pt}`,
    `Monthly award: ${currentUser.monthlyAward}`,
    `VA loan: ${currentUser.vaLoan}`,
    `Federal preference: ${currentUser.federalPreference}`,
    `FMP: ${currentUser.fmp}`
  ].map((fact) => `<span>${fact}</span>`).join("");
}

function signIn(userId = "mark", provider = "Prototype sign-in") {
  currentUser = demoUsers[userId] || demoUsers.mark;
  localStorage.setItem("vjn:currentUser", JSON.stringify({ userId: currentUser.id, provider }));
  loadWorkspaceState();
  authGate.classList.add("hidden");
  appShell.classList.add("signedIn");
  renderSignedInProfile(provider);
  renderUploadQueue();
  renderVoiceNotes();
  updateAdvisor();
}

function signOut() {
  saveWorkspaceState();
  currentUser = null;
  uploadedEvidence = {};
  voiceNotes = [];
  localStorage.removeItem("vjn:currentUser");
  authGate.classList.remove("hidden");
  appShell.classList.remove("signedIn");
}

function restoreSession() {
  try {
    const saved = JSON.parse(localStorage.getItem("vjn:currentUser") || "null");
    if (saved?.userId) {
      signIn(saved.userId, saved.provider || "Prototype sign-in");
      return;
    }
  } catch (error) {
    localStorage.removeItem("vjn:currentUser");
  }
  authGate.classList.remove("hidden");
  appShell.classList.remove("signedIn");
}

function renderKnowledgeVault() {
  evidenceInventoryTable.innerHTML = evidenceInventory.map((item) => `
    <div class="inventoryRow">
      <strong>${item.category}</strong>
      <span class="statusPill ${statusClass(item.status)}">${item.status}</span>
      <small>${item.note}</small>
    </div>
  `).join("");

  opportunityScoreList.innerHTML = opportunityScores.map((item) => `
    <div class="opportunityScoreRow">
      <div>
        <strong>${item.area}</strong>
        <small>${item.note}</small>
      </div>
      <span class="opportunityPill ${statusClass(item.opportunity)}">${item.opportunity}</span>
    </div>
  `).join("");

  vaultDocumentList.innerHTML = vaultDocuments.map((doc) => `
    <div class="vaultDocRow">
      <strong>${doc.name}</strong>
      <div class="vaultTags">${doc.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      <small>Linked to: ${doc.linked}</small>
    </div>
  `).join("");

  lifeTimelineList.innerHTML = lifeEvents.map((event) => `
    <div class="lifeEvent">
      <span class="eventWhen">${event.when}</span>
      <div>
        <strong>${event.title}</strong>
        <small>${event.detail}</small>
      </div>
      <span class="statusPill ${statusClass(event.status)}">${event.status}</span>
    </div>
  `).join("");
}

function renderSchedularWorkbench() {
  strategyList.innerHTML = schedularStrategies.map((item) => `
    <div class="strategyRow">
      <strong>${item.title}</strong>
      <small>${item.text}</small>
    </div>
  `).join("");

  conditionMatrixEl.innerHTML = `
    <div class="matrixHeader">
      <span>Condition</span><span>VA SC</span><span>SSDI</span><span>Rating</span><span>Ready</span>
    </div>
    ${conditionMatrix.map((row) => `
      <div class="matrixRow">
        <strong>${row.condition}</strong>
        <span>${row.va}</span>
        <span>${row.ssdi}</span>
        <span>${row.rating}</span>
        <span class="statusPill ${statusClass(row.ready)}">${row.ready}</span>
        <small>Last exam: ${row.lastExam} · Worsening: ${row.worsening}</small>
      </div>
    `).join("")}
  `;

  ssdiChecklist.innerHTML = ssdiMapItems.map((item, index) => `
    <label class="ssdiCheck">
      <input type="checkbox" ${index === 0 ? "" : ""} />
      <span>${item}</span>
    </label>
  `).join("");

  ssdiSteps.innerHTML = ssdiAssistSteps.map((step) => `
    <div class="ssdiStep">
      <strong>${step.title}</strong>
      <small>${step.text}</small>
    </div>
  `).join("");
}

function conditionReadiness(condition) {
  const done = condition.evidenceItems.filter((item) => item.done).length;
  return Math.round((done / condition.evidenceItems.length) * 100);
}

function graphOverallReadiness() {
  const total = graphConditions.reduce((sum, condition) => sum + conditionReadiness(condition), 0);
  return Math.round(total / graphConditions.length);
}

function readinessTone(score) {
  if (score >= 80) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

function renderGraphTabs() {
  graphEvidenceScore.textContent = `${graphOverallReadiness()}%`;
  graphTabsEl.innerHTML = graphTabs.map((tab) => `
    <button class="graphTab ${tab.id === activeGraphTab ? "active" : ""}" data-graph-tab="${tab.id}" role="tab" aria-selected="${tab.id === activeGraphTab}">
      ${tab.label}
    </button>
  `).join("");

  document.querySelectorAll(".graphTab").forEach((button) => {
    button.addEventListener("click", () => {
      activeGraphTab = button.dataset.graphTab;
      renderKnowledgeGraphLab();
    });
  });
}

function renderDocumentLinks() {
  const verified = graphDocuments.filter((doc) => doc.verified).length;
  const unlinked = graphDocuments.filter((doc) => doc.linkedConditions.length === 0 && doc.linkedEvents.length === 0).length;
  graphPanel.innerHTML = `
    <div class="graphStats">
      <div><strong>${graphDocuments.length}</strong><span>Total documents</span></div>
      <div><strong>${verified}</strong><span>Verified</span></div>
      <div><strong>${graphDocuments.length - verified}</strong><span>Still needed</span></div>
      <div><strong>${unlinked}</strong><span>Unlinked</span></div>
    </div>
    <div class="graphDocList">
      ${graphDocuments.map((doc) => `
        <article class="graphDocCard ${doc.verified ? "verified" : "missing"}">
          <div>
            <strong>${doc.name}</strong>
            <p>${doc.notes}</p>
          </div>
          <span class="statusPill ${doc.verified ? "complete" : "missing"}">${doc.verified ? "Verified" : "Needed"}</span>
          <div class="graphTags">${doc.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
          <small><b>Conditions:</b> ${doc.linkedConditions.length ? doc.linkedConditions.join(", ") : "None yet"}</small>
          <small><b>Events:</b> ${doc.linkedEvents.length ? doc.linkedEvents.join(", ") : "None yet"}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function renderEvidenceScore() {
  const sorted = [...graphConditions].sort((a, b) => conditionReadiness(a) - conditionReadiness(b));
  graphPanel.innerHTML = `
    <div class="graphSummary ${readinessTone(graphOverallReadiness())}">
      <span>Overall evidence completeness</span>
      <strong>${graphOverallReadiness()}%</strong>
      <p>Focus on red conditions first. Each checklist item turns a vague concern into a document or appointment request.</p>
    </div>
    <div class="conditionScoreList">
      ${sorted.map((condition) => {
        const score = conditionReadiness(condition);
        const done = condition.evidenceItems.filter((item) => item.done).length;
        return `
          <article class="conditionScoreCard">
            <div class="scoreHead">
              <div>
                <strong>${condition.name}</strong>
                <span>${condition.category}</span>
              </div>
              <b class="${readinessTone(score)}">${score}%</b>
            </div>
            <div class="scoreBar"><i style="width:${score}%"></i></div>
            <small>${done}/${condition.evidenceItems.length} evidence items present</small>
            <ul>
              ${condition.evidenceItems.map((item) => `<li class="${item.done ? "done" : "missing"}">${item.done ? "Present" : "Missing"}: ${item.label}</li>`).join("")}
            </ul>
            <p>${condition.notes}</p>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderWhatChanged() {
  const active = graphConditions.find((condition) => condition.id === activeChangedConditionId) || graphConditions[0];
  graphPanel.innerHTML = `
    <div class="whatChangedIntro">
      <strong>The question a VSO will ask</strong>
      <p>"What is different today than when VA last rated this condition?" This module helps turn that answer into a focused evidence request.</p>
    </div>
    <div class="conditionChipList">
      ${graphConditions.map((condition) => `
        <button class="conditionChip ${condition.id === active.id ? "active" : ""}" data-condition-id="${condition.id}">
          ${condition.name}
        </button>
      `).join("")}
    </div>
    <article class="changedCard">
      <div class="scoreHead">
        <div>
          <strong>${active.name}</strong>
          <span>${active.category} · Evidence completeness ${conditionReadiness(active)}%</span>
        </div>
        <span class="statusPill ${active.vaSC ? "complete" : "missing"}">${active.vaSC ? "VA SC" : "Not SC"}</span>
      </div>
      <label>
        <span>What changed since the last rating?</span>
        <textarea placeholder="Symptoms, frequency, severity, new treatment, new limitations, new tests, hospitalizations, or daily-life impact."></textarea>
      </label>
      <div class="promptList">
        ${active.whatChangedPrompts.map((prompt) => `<small>${prompt}</small>`).join("")}
      </div>
    </article>
  `;

  document.querySelectorAll(".conditionChip").forEach((button) => {
    button.addEventListener("click", () => {
      activeChangedConditionId = Number(button.dataset.conditionId);
      renderWhatChanged();
    });
  });
}

function renderMeetingPacket() {
  const dualConfirmed = graphConditions.filter((condition) => condition.vaSC && condition.ssdi);
  const gapConditions = graphConditions.filter((condition) => conditionReadiness(condition) < 50);
  const missingDocs = graphDocuments.filter((doc) => !doc.verified);
  const verifiedEvents = graphEvents.filter((event) => event.verified);
  const questions = [
    `For dual-confirmed conditions (${dualConfirmed.map((condition) => condition.name).join(", ")}), what individual ratings are currently assigned and which are evidence-ready for schedular review?`,
    `For evidence-gap conditions (${gapConditions.map((condition) => condition.name).join(", ")}), what specific records should be gathered first?`,
    "How should aortic surgery, dialysis episode, residual numbness, scars, and monitoring be developed before any claim theory is considered?",
    "Given the preference for schedular review, what path preserves future consulting or employment options?"
  ];

  graphPanel.innerHTML = `
    <div class="packetGrid">
      <article>
        <span class="sectionLabel">Verified story</span>
        ${verifiedEvents.map((event) => `<p><b>${event.year}</b> ${event.label}</p>`).join("")}
      </article>
      <article>
        <span class="sectionLabel">Evidence gaps</span>
        ${missingDocs.map((doc) => `<p><b>${doc.name}</b> ${doc.notes}</p>`).join("")}
      </article>
      <article class="packetWide">
        <span class="sectionLabel">VSO-ready questions</span>
        <ol>${questions.map((question) => `<li>${question}</li>`).join("")}</ol>
      </article>
    </div>
    <div class="graphDisclaimer">Preparation tool only. Review with an accredited VSO, claims attorney, or qualified representative before filing.</div>
  `;
}

function renderSsdiMapper() {
  const matched = graphConditions.filter((condition) => ssdiSelectedConditions.includes(condition.name));
  const unmatched = graphConditions.filter((condition) => !ssdiSelectedConditions.includes(condition.name));
  const strength = matched.length >= 3 ? "Strong SSDI-to-SC overlap" : matched.length ? "Partial overlap" : "No SSDI conditions selected";

  graphPanel.innerHTML = `
    <div class="mapperIntro">
      <strong>${strength}</strong>
      <p>Your FMP authorization lists VA-adjudicated conditions. Your SSDI file lists what SSA recognized as disabling. Where they overlap, the app can build better questions for schedular review.</p>
    </div>
    <div class="mapperGrid">
      ${graphConditions.map((condition) => `
        <button class="mapperCondition ${ssdiSelectedConditions.includes(condition.name) ? "active" : ""}" data-ssdi-condition="${condition.name}">
          <strong>${condition.name}</strong>
          <span>${condition.category}</span>
        </button>
      `).join("")}
    </div>
    <div class="mapperResults">
      <article>
        <h3>Matched conditions</h3>
        ${matched.map((condition) => `<p>${condition.name}<span>VA-adjudicated + SSA-recognized</span></p>`).join("") || "<p>None selected yet.</p>"}
      </article>
      <article>
        <h3>Not matched yet</h3>
        ${unmatched.map((condition) => `<p>${condition.name}<span>Research worsening, secondary, or non-SC evidence lane</span></p>`).join("")}
      </article>
    </div>
    <div class="ssdiPhaseList">
      ${ssdiApplicationPhases.map((phase) => `
        <article class="ssdiPhase">
          <h3>${phase.phase}</h3>
          ${phase.steps.map((step) => `
            <div>
              <b>${step.status}</b>
              <span>${step.title}</span>
              <small>${step.detail}</small>
            </div>
          `).join("")}
        </article>
      `).join("")}
    </div>
  `;

  document.querySelectorAll(".mapperCondition").forEach((button) => {
    button.addEventListener("click", () => {
      const condition = button.dataset.ssdiCondition;
      ssdiSelectedConditions = ssdiSelectedConditions.includes(condition)
        ? ssdiSelectedConditions.filter((item) => item !== condition)
        : [...ssdiSelectedConditions, condition];
      renderSsdiMapper();
    });
  });
}

function renderKnowledgeGraphLab() {
  renderGraphTabs();
  if (activeGraphTab === "links") renderDocumentLinks();
  if (activeGraphTab === "score") renderEvidenceScore();
  if (activeGraphTab === "changed") renderWhatChanged();
  if (activeGraphTab === "packet") renderMeetingPacket();
  if (activeGraphTab === "mapper") renderSsdiMapper();
}

function renderUploadQueue() {
  const uploadCount = Object.values(uploadedEvidence).reduce((sum, files) => sum + files.length, 0);
  intakeSignal.textContent = `${uploadCount} upload${uploadCount === 1 ? "" : "s"}`;
  uploadQueue.innerHTML = intakeUploadTargets.map((target) => {
    const files = uploadedEvidence[target.id] || [];
    return `
      <article class="uploadTarget ${files.length ? "hasFiles" : ""}">
        <div class="uploadTargetTop">
          <div>
            <strong>${target.title}</strong>
            <span>${target.category}</span>
          </div>
          <span class="statusPill ${files.length ? "complete" : "missing"}">${files.length ? "Uploaded" : "Missing"}</span>
        </div>
        <p>${target.linkTo}</p>
        <label class="uploadDrop">
          <input type="file" multiple accept="${target.accepts}" data-upload-target="${target.id}" />
          <span>${files.length ? "Add more files" : "Choose files"}</span>
          <small>or drag evidence here in the production version</small>
        </label>
        ${files.length ? `
          <div class="uploadedFileList">
            ${files.map((file) => `
              <div>
                <span>${file.name}</span>
                <small>${file.type || "unknown type"} · ${file.size}</small>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-upload-target]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const targetId = event.target.dataset.uploadTarget;
      const files = Array.from(event.target.files || []).map((file) => ({
        name: file.name,
        size: formatBytes(file.size),
        type: file.type || file.name.split(".").pop()?.toUpperCase() || "File"
      }));
      uploadedEvidence[targetId] = [...(uploadedEvidence[targetId] || []), ...files];
      saveWorkspaceState();
      renderUploadQueue();
    });
  });
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function setupVoiceRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    voiceSupportStatus.textContent = "Voice unavailable in this browser; typed notes still work";
    voiceStartButton.disabled = true;
    voiceStopButton.disabled = true;
    return;
  }

  recognition = new Recognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  voiceSupportStatus.textContent = "Voice ready";

  recognition.addEventListener("result", (event) => {
    let finalText = "";
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript;
      if (event.results[index].isFinal) {
        finalText += transcript;
      } else {
        interimText += transcript;
      }
    }
    const base = voiceTranscript.value.replace(/\s*\[listening:.*?\]\s*$/i, "").trim();
    const nextText = [base, finalText.trim()].filter(Boolean).join(" ");
    voiceTranscript.value = interimText.trim() ? `${nextText} [listening: ${interimText.trim()}]` : nextText;
  });

  recognition.addEventListener("end", () => {
    isRecording = false;
    voiceStartButton.disabled = false;
    voiceStopButton.disabled = true;
    voiceSupportStatus.textContent = "Voice paused";
    voiceTranscript.value = voiceTranscript.value.replace(/\s*\[listening:.*?\]\s*$/i, "").trim();
  });

  recognition.addEventListener("error", () => {
    isRecording = false;
    voiceStartButton.disabled = false;
    voiceStopButton.disabled = true;
    voiceSupportStatus.textContent = "Voice stopped; typed notes still work";
  });
}

function startVoiceIntake() {
  if (!recognition || isRecording) return;
  isRecording = true;
  voiceStartButton.disabled = true;
  voiceStopButton.disabled = false;
  voiceSupportStatus.textContent = "Listening";
  recognition.start();
}

function stopVoiceIntake() {
  if (!recognition || !isRecording) return;
  recognition.stop();
}

function saveVoiceNote() {
  const text = voiceTranscript.value.replace(/\s*\[listening:.*?\]\s*$/i, "").trim();
  if (!text) {
    voiceSupportStatus.textContent = "Add a transcript or typed note first";
    return;
  }
  voiceNotes.unshift({
    topic: voiceTopic.value,
    text,
    created: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  });
  saveWorkspaceState();
  voiceTranscript.value = "";
  voiceSupportStatus.textContent = "Note saved";
  renderVoiceNotes();
}

function renderVoiceNotes() {
  voiceNotesEl.innerHTML = voiceNotes.length ? voiceNotes.map((note) => `
    <article class="voiceNote">
      <div>
        <strong>${note.topic}</strong>
        <span>${note.created}</span>
      </div>
      <p>${note.text}</p>
    </article>
  `).join("") : `
    <div class="emptyVoiceNote">
      Saved notes will appear here and can feed the personal statement, surgery timeline, SSDI context, or VSO packet.
    </div>
  `;
}

document.querySelectorAll("[data-auth-provider]").forEach((button) => {
  button.addEventListener("click", () => {
    signIn(button.dataset.userId || "mark", `${button.dataset.authProvider} prototype`);
  });
});

document.querySelectorAll("[data-demo-user]").forEach((button) => {
  button.addEventListener("click", () => {
    signIn(button.dataset.demoUser, "Demo profile");
  });
});

signOutButton.addEventListener("click", signOut);

function getBriefText() {
  return briefSections.map((section) => {
    const points = section.points.map((point) => `- ${point}`).join("\\n");
    return `${section.title}\\n${points}`;
  }).join("\\n\\n");
}

function renderJourneyBrief() {
  briefGrid.innerHTML = briefSections.map((section) => `
    <div class="briefCard">
      <h3>${section.title}</h3>
      <ul>
        ${section.points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </div>
  `).join("");
}

function renderValidationProtocol() {
  protocolGrid.innerHTML = protocolSteps.map((step, index) => `
    <div class="protocolCard">
      <span>${step.phase}</span>
      <strong>${step.task}</strong>
      <small>${step.measure}</small>
      <label>
        <input type="checkbox" ${index < 2 ? "checked" : ""} />
        Evidence collected
      </label>
    </div>
  `).join("");

  document.querySelectorAll(".protocolCard input").forEach((input) => {
    input.addEventListener("change", updateValidationResult);
  });
  updateValidationResult();
}

function updateValidationResult() {
  const checked = document.querySelectorAll(".protocolCard input:checked").length;
  validationResult.textContent = checked === protocolSteps.length ? "Validated" : `${checked}/${protocolSteps.length} steps`;
  validationResult.classList.toggle("complete", checked === protocolSteps.length);
}

async function copyJourneyBrief() {
  const text = getBriefText();
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "Brief copied for a VSO-ready conversation.";
  } catch (error) {
    copyStatus.textContent = "Brief is ready above; clipboard access was unavailable.";
  }
}

function updateAdvisor() {
  const topic = queryInput.value.trim() || `${selectedCategory.toLowerCase()} opportunities`;
  const user = currentUser || demoUsers.mark;
  advisorText.textContent = `For your ${user.branch} veteran, ${user.state} resident, ${user.rating} service-connected ${profile.toLowerCase()} profile, start with ${topic}. Current strategy favors schedular evidence review over TDIU so future work and consulting options stay open.`;
  const category = categories.find((item) => item.name === selectedCategory);
  matchCount.textContent = String(24 + category.count);
}

document.querySelectorAll(".profileSwitch button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".profileSwitch button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    profile = button.dataset.profile;
    updateAdvisor();
  });
});

document.querySelectorAll(".navItem").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".navItem").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    queryInput.value = button.dataset.module;
    updateAdvisor();
  });
});

queryInput.addEventListener("input", updateAdvisor);

document.querySelector("#prepareButton").addEventListener("click", () => {
  actions.unshift({
    title: `Prepare ${selectedCategory} eligibility packet`,
    meta: "Checklist, source links, evidence questions, and next steps created",
    priority: "Ready"
  });
  renderActions();
});

document.querySelector("#statementButton").addEventListener("click", () => {
  actions.unshift({
    title: "Draft personal statement outline",
    meta: "Chronology, symptoms, treatment history, work impact, and daily limitations queued for review",
    priority: "Ready"
  });
  renderActions();
});

copyBriefButton.addEventListener("click", copyJourneyBrief);
voiceStartButton.addEventListener("click", startVoiceIntake);
voiceStopButton.addEventListener("click", stopVoiceIntake);
saveVoiceNoteButton.addEventListener("click", saveVoiceNote);

renderCategories();
renderDetail();
renderActions();
renderClarityPanel();
renderUnderstandingCheck();
renderKnowledgeVault();
renderSchedularWorkbench();
renderKnowledgeGraphLab();
renderUploadQueue();
setupVoiceRecognition();
renderVoiceNotes();
renderJourneyBrief();
renderValidationProtocol();
renderJourneyMap();
renderClaimCoach();
updateAdvisor();
restoreSession();
