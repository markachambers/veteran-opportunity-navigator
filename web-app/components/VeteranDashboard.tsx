"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { deleteDocument, deleteDuplicateDocuments } from "@/app/actions";

const categories = [
  { name: "Federal", initials: "FE", color: "green", count: 0, value: "Check", items: ["Federal hiring preference", "VA health care", "VR&E eligibility screen"], source: "VA / OPM / agency review" },
  { name: "State", initials: "ST", color: "gold", count: 0, value: "Check", items: ["State veteran benefits", "County VSO resources", "Property tax or parks programs"], source: "State veteran affairs office" },
  { name: "Commissary", initials: "CX", color: "teal", count: 0, value: "Check", items: ["Commissary access", "Exchange access", "MWR retail facility access"], source: "VA / DoD access review" },
  { name: "Education", initials: "ED", color: "blue", count: 0, value: "Check", items: ["GI Bill review", "State tuition programs", "VR&E education or training path"], source: "VA / state education review" },
  { name: "Owner/Buyer", initials: "HO", color: "red", count: 0, value: "Check", items: ["VA home loan eligibility", "Funding-fee status", "Restoration or remaining-entitlement strategy"], source: "VA COE / lender review" },
  { name: "Health", initials: "HC", color: "green", count: 0, value: "Check", items: ["VA health care", "Foreign Medical Program if applicable", "Travel reimbursement check"], source: "VA health care review" },
  { name: "Schedular Review", initials: "SR", color: "gold", count: 0, value: "Investigate", items: ["Current rating evidence matrix", "Secondary-condition review", "Need individual rating breakdown"], source: "VA rating evidence review" },
  { name: "Family", initials: "FA", color: "teal", count: 0, value: "Check", items: ["Dependent add-on", "Spouse/dependent education", "Survivor or caregiver programs"], source: "VA family benefit review" },
];

const actions = [
  { title: "Upload latest VA rating decision", meta: "Needed to identify individual ratings, diagnostic codes, effective dates, and reasons.", priority: "High" },
  { title: "Map any SSDI basis to VA service-connected conditions", meta: "Use SSA evidence to understand overlap while keeping SSA and VA standards separate.", priority: "Next" },
  { title: "Build employment and functional impact timeline", meta: "Needed for TDIU conversations, SSDI context, and work-limit documentation.", priority: "Next" },
  { title: "Check state and county benefits", meta: "Property tax, DMV, parks, education, and local benefits depend on residence and proof.", priority: "Open" },
  { title: "Review home loan and property goals", meta: "COE, funding-fee status, entitlement, and state property tax rules should be checked if housing matters.", priority: "Open" },
  { title: "Prepare VSO questions", meta: "Turn uploaded evidence into a focused representative conversation.", priority: "Open" },
];

const evidenceConfig = [
  { category: "Service Records", docCategory: "service-records", note: "Service verification and proof of honorable service captured." },
  { category: "VA Letters", docCategory: "va-letters", note: "Benefit summary, FMP, civil-service, COE, or other VA letters." },
  { category: "Rating Decisions", docCategory: "rating-decision", note: "Need full decision with individual ratings, diagnostic codes, and reasons." },
  { category: "SSDI Records", docCategory: "ssdi-records", note: "Need award letter or BPQY showing SSA-recognized conditions." },
  { category: "Surgical Records", docCategory: "surgery-records", note: "Need surgery, hospitalization, complications, follow-up care, and residual notes where applicable." },
  { category: "Medication List", docCategory: "medications", note: "Needed for current treatment profile and functional impact." },
  { category: "Employment Timeline", docCategory: "employment", note: "Needed to understand work limits and timeline context." },
  { category: "Personal Statement Timeline", docCategory: "personal-statement", note: "Needed to explain symptoms, changes, and daily limitations." },
];

const documentCategoryLabels: Record<string, string> = Object.fromEntries(
  evidenceConfig.map((item) => [item.docCategory, item.category])
);

const opportunityScores = [
  { area: "State Benefits", opportunity: "Check", note: "State and county benefits should be personalized after residence is entered." },
  { area: "Home Loan Entitlement Review", opportunity: "Check", note: "Upload a COE to review funding-fee status, entitlement, and housing questions." },
  { area: "Property Tax", opportunity: "Check", note: "Rules vary by state, county, rating, P&T status, and filing deadlines." },
  { area: "Schedular Increase Review", opportunity: "Investigate", note: "Needs individual rating breakdown and current evidence." },
  { area: "VR&E", opportunity: "Check", note: "Explore if education, training, employment, or independent-living support is useful." },
  { area: "Foreign Medical Program", opportunity: "Check", note: "Upload any FMP letter or identify overseas care needs." },
  { area: "Federal Employment Preference", opportunity: "Check", note: "Upload civil-service or preference proof if federal employment matters." },
  { area: "Residual / Secondary Review", opportunity: "Investigate", note: "Needs symptom timeline, medical records, and accredited review." },
];

const nonVaBenefitLanes = [
  {
    area: "Florida State Parks",
    level: "Strong",
    why: "Florida lists free lifetime military entrance passes for honorably discharged veterans with service-connected disabilities.",
    next: "Bring photo ID, proof of honorable discharge, and VA service-connected disability documentation to confirm the pass process.",
    source: "Florida State Parks",
    sourceUrl: "https://www.floridastateparks.org/learn/florida-state-parks-appreciate-veterans",
  },
  {
    area: "Florida Property Tax",
    level: "Investigate",
    why: "Florida FDVA lists a basic property tax exemption for resident veterans with a VA-certified service-connected disability of 10% or greater.",
    next: "Ask the county property appraiser which exemptions apply now and which require permanent and total status.",
    source: "Florida Department of Veterans' Affairs",
    sourceUrl: "https://floridavets.org/benefits-services/housing/",
  },
  {
    area: "Federal Hiring Preference",
    level: "Ready",
    why: "The civil-service letter supports the federal employment lane, including 30% or more disabled veteran hiring authority review.",
    next: "Use the civil-service letter, DD-214/proof of service, and SF-15 where required for federal applications.",
    source: "U.S. Office of Personnel Management",
    sourceUrl: "https://www.opm.gov/fedshirevets/veteran-job-seekers/vets/",
  },
  {
    area: "Commissary, Exchange, MWR",
    level: "Likely",
    why: "VA lists commissary and exchange eligibility for honorably discharged veterans with a service-connected disability rating.",
    next: "Confirm VHIC status and whether the card displays the required access indicator before visiting an installation.",
    source: "VA.gov",
    sourceUrl: "https://www.va.gov/resources/commissary-and-exchange-privileges-for-veterans/",
  },
  {
    area: "Home Buying / Entitlement Strategy",
    level: "Ready",
    why: "The COE confirms VA home-loan eligibility, funding-fee exemption, and prior entitlement charged.",
    next: "Ask a VA-savvy lender about remaining entitlement, restoration, county loan limits, and buying another home.",
    source: "Uploaded COE",
    sourceUrl: "",
  },
  {
    area: "Education / Training",
    level: "Check",
    why: "Florida and federal lanes may include education, training, VR&E, and workforce programs depending on goals and eligibility.",
    next: "Separate claim/medical goals from career goals; identify whether training, certification, or self-employment support is useful.",
    source: "FDVA / VA program review",
    sourceUrl: "https://floridavets.org/",
  },
  {
    area: "County Veteran Services",
    level: "High",
    why: "County-level benefits, tax filing steps, parks processes, transportation help, and local nonprofit resources vary by county.",
    next: "Add county to the profile, then build a county checklist for property appraiser, CVSO, parks, and local nonprofit referrals.",
    source: "Local checklist",
    sourceUrl: "",
  },
  {
    area: "Hunting / Fishing License Review",
    level: "Investigate",
    why: "Florida has created license-fee exemptions for honorably discharged veterans with qualifying service-connected disabilities.",
    next: "Confirm current FWC rules, proof required, and whether the veteran's rating category qualifies.",
    source: "FDVA legislative update",
    sourceUrl: "https://www.floridavets.org/governor-desantis-signs-legislation-to-support-florida-veterans-and-their-families/",
  },
  {
    area: "DMV Veteran Designation",
    level: "Ready",
    why: "Florida veterans can add a veteran designation to a driver license or ID card, and veterans with proof of status may avoid certain tax collector service fees.",
    next: "Bring DD-214 or accepted proof of veteran status to a local service center or tax collector office.",
    source: "FLHSMV",
    sourceUrl: "https://www.flhsmv.gov/driver-licenses-id-cards/newdl/designation-fees/",
  },
  {
    area: "Vehicle / License Plate Review",
    level: "Check",
    why: "Florida has military and veteran motor-vehicle forms, plates, and some registration-fee exemptions tied to status, orders, disability, or timing.",
    next: "Ask the county tax collector which plate, registration, or initial-fee exemptions match your exact status before buying or registering a vehicle.",
    source: "FLHSMV military forms",
    sourceUrl: "https://www.flhsmv.gov/military/military-forms-packet/",
  },
  {
    area: "National Parks / Federal Recreation",
    level: "Ready",
    why: "U.S. military veterans are eligible for a free Military Lifetime Pass for national parks and other federal recreation lands.",
    next: "Apply online or ask at a participating federal recreation site; keep proof of veteran status available.",
    source: "National Park Service",
    sourceUrl: "https://www.nps.gov/planyourvisit/veterans-and-gold-star-families-free-access.htm",
  },
  {
    area: "Theme Park Military Offers",
    level: "Seasonal",
    why: "Programs such as Waves of Honor may offer veteran admission or discounts, but redemption windows and guest rules change by park and year.",
    next: "Check SeaWorld/Busch Gardens/United Parks offers before Memorial Day, Military Appreciation Month, Veterans Day, and planned travel.",
    source: "United Parks Waves of Honor",
    sourceUrl: "https://unitedparks.com/programs/waves-of-honor/",
  },
];

function slugifyState(state: string) {
  return encodeURIComponent(state).replace(/%20/g, "-");
}

function branchBenefitSource(branch?: string | null) {
  const normalized = branch?.toLowerCase() || "";
  if (normalized.includes("army") || normalized.includes("guard") || normalized.includes("reserve")) {
    return {
      label: "MyArmyBenefits",
      stateBase: "https://myarmybenefits.us.army.mil/Benefit-Library/State/Territory-Benefits",
      federalUrl: "https://myarmybenefits.us.army.mil/Benefit-Library",
    };
  }

  if (normalized.includes("air") || normalized.includes("space")) {
    return {
      label: "MyAirForceBenefits",
      stateBase: "https://myairforcebenefits.us.af.mil/Benefit-Library/State/Territory-Benefits",
      federalUrl: "https://myairforcebenefits.us.af.mil/Benefit-Library/Federal-Benefits?type=A+to+Z",
    };
  }

  return {
    label: "Military OneSource",
    stateBase: "https://myairforcebenefits.us.af.mil/Benefit-Library/State/Territory-Benefits",
    federalUrl: "https://www.militaryonesource.mil/benefits/benefits-finder/",
  };
}

function stateBenefitsUrl(state: string, branch?: string | null) {
  const source = branchBenefitSource(branch);
  return `${source.stateBase}/${slugifyState(state)}`;
}

function stateDisplay(state?: string | null) {
  const value = state?.trim();
  if (!value) return "Add state";
  const aliases: Record<string, string> = { FL: "Florida", DC: "District of Columbia" };
  return aliases[value.toUpperCase()] || value;
}

function isRankLike(value?: string | null) {
  return /^(E|O|W)-?[0-9]$/i.test(value || "");
}

function ratingDisplay(value?: string | null) {
  if (!value || isRankLike(value)) return "Add rating";
  return value;
}

function nationwideStateBenefitLanes(state: string, branch?: string | null) {
  if (state === "Florida") return nonVaBenefitLanes;

  const source = branchBenefitSource(branch);
  const guideUrl = stateBenefitsUrl(state, branch);

  return [
    {
      area: `${state} State Benefits Guide`,
      level: "Start Here",
      why: `${state} may offer state-specific benefits for veterans and families, including tax, education, employment, licensing, parks, and local assistance programs.`,
      next: `Open the ${state} state benefits guide, then save the highest-value items into this veteran's action list.`,
      source: `${source.label} state/territory benefits`,
      sourceUrl: guideUrl,
    },
    {
      area: `${state} Veteran Affairs Office`,
      level: "High",
      why: "Every state or territory has veteran affairs resources or partner offices that can explain resident benefits and local application steps.",
      next: "Find the state veteran affairs office, then ask for county/local VSO contacts and benefit guides for the veteran's county.",
      source: "NASDVA state directory",
      sourceUrl: "https://nasdva.us/resources/",
    },
    {
      area: "Property Tax / Housing",
      level: "Investigate",
      why: "Many states have property tax exemptions, homestead add-ons, housing loans, home modification programs, or disabled-veteran housing benefits.",
      next: `Check ${state} resident rules, disability-rating thresholds, P&T requirements, surviving spouse rules, and county filing deadlines.`,
      source: "State benefits guide",
      sourceUrl: guideUrl,
    },
    {
      area: "DMV / License Plates",
      level: "Check",
      why: "Most states have veteran designations, veteran plates, disabled-veteran plates, or fee exemptions, but requirements vary widely.",
      next: "Check driver-license veteran designation, vehicle registration, disabled-veteran plate, parking, and title/initial-fee rules.",
      source: "State benefits guide",
      sourceUrl: guideUrl,
    },
    {
      area: "Education for Veteran / Family",
      level: "Check",
      why: "State education benefits may include tuition waivers, in-state tuition, scholarships, dependent benefits, or National Guard programs.",
      next: "Separate benefits for the veteran, spouse, dependents, survivors, and National Guard members; confirm residency and rating requirements.",
      source: "State benefits guide",
      sourceUrl: guideUrl,
    },
    {
      area: `${branch || "Military"} Federal Benefits`,
      level: "Branch",
      why: "Some federal benefit explainers and resource locators are organized by branch/component, life event, and family role.",
      next: "Use the branch-aware federal benefits library to check family, survivor, retirement, Reserve/Guard, and recently separated categories.",
      source: source.label,
      sourceUrl: source.federalUrl,
    },
    {
      area: "Parks, Hunting, Fishing",
      level: "Investigate",
      why: "Many states offer park passes, camping discounts, hunting/fishing discounts, or free licenses for disabled veterans.",
      next: "Check state parks, fish and wildlife, and local recreation sites before travel or annual license renewal.",
      source: "State benefits guide",
      sourceUrl: guideUrl,
    },
    {
      area: "Employment / Business",
      level: "Check",
      why: "State programs may include hiring preference, workforce training, veteran-owned business certification, fee waivers, or small business help.",
      next: "Check state hiring preference, occupational license fee waivers, workforce grants, and veteran-owned business resources.",
      source: "State benefits guide",
      sourceUrl: guideUrl,
    },
    {
      area: "Emergency / Local Assistance",
      level: "Local",
      why: "Some benefits are county, city, nonprofit, or emergency-assistance programs rather than statewide VA programs.",
      next: "Add county and ZIP code to the future profile so the app can search local veteran service offices, food, transportation, utilities, legal aid, and nonprofit help.",
      source: "State and county research lane",
      sourceUrl: "https://www.va.gov/find-locations/",
    },
    {
      area: "Commissary, Exchange, MWR",
      level: "Federal",
      why: "This lane follows federal/DoD rules rather than state rules and may apply nationwide to honorably discharged veterans with service-connected disability ratings.",
      next: "Confirm VHIC access indicator and installation access rules before visiting.",
      source: "VA.gov",
      sourceUrl: "https://www.va.gov/resources/commissary-and-exchange-privileges-for-veterans/",
    },
    {
      area: "National Parks / Federal Recreation",
      level: "Federal",
      why: "U.S. military veterans are eligible for a free Military Lifetime Pass for national parks and other federal recreation lands.",
      next: "Apply online or ask at a participating federal recreation site; keep proof of veteran status available.",
      source: "National Park Service",
      sourceUrl: "https://www.nps.gov/planyourvisit/veterans-and-gold-star-families-free-access.htm",
    },
    {
      area: "Theme Park / Holiday Perks",
      level: "Seasonal",
      why: "Merchant, attraction, Memorial Day, Military Appreciation Month, and Veterans Day offers are national or regional and change by date.",
      next: "Check ID.me/SheerID status and official merchant pages before travel or holidays.",
      source: "United Parks Waves of Honor",
      sourceUrl: "https://unitedparks.com/programs/waves-of-honor/",
    },
  ];
}

const seasonalPerks = [
  {
    window: "January",
    title: "Reset annual recreation offers",
    detail: "Some park and entertainment programs refresh annually. Verify ID.me status and offer rules early.",
  },
  {
    window: "April-May",
    title: "Military Appreciation Month / Memorial Day scan",
    detail: "Check theme parks, local attractions, restaurants, museums, and county events. Offers often require online redemption before the holiday.",
  },
  {
    window: "September-November",
    title: "Veterans Day scan",
    detail: "Build a local checklist for meals, retail discounts, museums, parks, dental/health events, and city/county ceremonies.",
  },
  {
    window: "Before travel",
    title: "Proof-of-status packet",
    detail: "Carry VA health ID card, driver license veteran designation, DD-214 copy, state park pass, national parks pass, and ID.me login access.",
  },
];

const possibilityLibrary = [
  {
    category: "Disability Compensation",
    initials: "DC",
    stage: "Core VA",
    examples: ["Current ratings", "Increases", "Secondary conditions", "Presumptives", "Residuals", "Appeals / supplemental review"],
    trigger: "A veteran has service-connected conditions, new symptoms, worsening, or missing decision/rating details.",
    evidence: ["Latest rating decision", "Medical treatment records", "Symptom logs", "Functional impact statement"],
    ask: "Which current conditions, secondary pathways, or residuals should be reviewed with an accredited representative?",
  },
  {
    category: "TDIU",
    initials: "IU",
    stage: "Work impact",
    examples: ["Unemployability review", "Work history", "Employer forms", "Vocational evidence", "SSDI overlap"],
    trigger: "A veteran is unemployed, on SSDI, losing work, or unable to maintain substantially gainful employment because of service-connected conditions.",
    evidence: ["Work timeline", "SSDI/BPQY records", "Provider notes", "VA Form 21-8940 discussion", "Employer Form 21-4192 discussion"],
    ask: "Should TDIU be discussed, and how does it compare with schedular review for this veteran's goals?",
  },
  {
    category: "Health Care",
    initials: "HC",
    stage: "Care access",
    examples: ["VA health care", "Priority groups", "Prescriptions", "Travel reimbursement", "Foreign Medical Program", "Caregiver support"],
    trigger: "A veteran needs treatment, medication, travel support, overseas care, or caregiver/family support.",
    evidence: ["Enrollment status", "Medication list", "FMP letter", "Appointment history", "Travel receipts"],
    ask: "What care access, travel, prescription, or overseas-care benefits should be checked?",
  },
  {
    category: "Housing / Property",
    initials: "HO",
    stage: "Home and taxes",
    examples: ["VA home loan", "Funding-fee exemption", "Entitlement restoration", "Property tax", "Adaptive housing", "Homelessness prevention"],
    trigger: "A veteran owns, rents, plans to buy, needs accessibility support, or may qualify for property-tax relief.",
    evidence: ["COE", "Mortgage/rental status", "County", "P&T status", "Disability rating proof"],
    ask: "Which housing, loan, county tax, or accessibility programs should be investigated?",
  },
  {
    category: "Education / Training",
    initials: "ED",
    stage: "Next chapter",
    examples: ["GI Bill", "VR&E", "State tuition waivers", "Certifications", "Boots to Business", "Dependent education"],
    trigger: "A veteran or family member wants training, college, business skills, certifications, or a new career path.",
    evidence: ["Service dates", "Disability rating", "Education history", "Career goals", "Dependent status"],
    ask: "What education, training, business, or family education lanes match this profile?",
  },
  {
    category: "Employment / Business",
    initials: "EB",
    stage: "Income path",
    examples: ["Federal preference", "Schedule A", "State hiring preference", "Veteran-owned business", "SBA resources", "Licensing fee waivers"],
    trigger: "A veteran wants employment, self-employment, consulting, contracting, or business formation support.",
    evidence: ["Civil-service letter", "Resume", "Work history", "Business goals", "State license needs"],
    ask: "Which job, federal hiring, business, or occupational licensing advantages should be checked?",
  },
  {
    category: "Family / Survivor",
    initials: "FS",
    stage: "Household",
    examples: ["Dependents", "Spouse benefits", "CHAMPVA", "DEA", "DIC", "Caregiver program", "Burial / memorial"],
    trigger: "A veteran has a spouse, dependents, caregiver, survivor questions, P&T status, or end-of-life planning needs.",
    evidence: ["Marriage/dependent records", "P&T status", "Household needs", "Caregiver role", "Death/burial planning docs"],
    ask: "Which family, survivor, dependent, caregiver, or memorial benefits should be explained?",
  },
  {
    category: "State / Local / Perks",
    initials: "SL",
    stage: "Quality of life",
    examples: ["DMV", "Parks", "Hunting/fishing", "County VSO", "Amusement parks", "Memorial Day / Veterans Day offers"],
    trigger: "A veteran changes state/county, travels, buys a vehicle, visits parks, or wants everyday savings and local help.",
    evidence: ["State", "County", "Veteran ID", "DD-214", "VA rating proof", "ID.me/SheerID status"],
    ask: "What state, county, recreation, DMV, and seasonal benefits should be checked before the next life event?",
  },
];

const lifeEvents = [
  { when: "Service period", event: "Military service", evidence: "DD-214 / service verification", impact: "Eligibility foundation", status: "Missing", detail: "Upload service records to verify branch, dates, character of service, and occupational history." },
  { when: "Current", event: "Current VA rating status", evidence: "Benefit summary / rating decision", impact: "Benefit lanes", status: "Missing", detail: "Upload VA letters to verify combined rating, P&T status, payment, and current conditions." },
  { when: "Current", event: "Current medical picture", evidence: "Treatment records / medication list", impact: "Care and evidence", status: "Missing", detail: "Upload current care records to understand diagnoses, treatment, and functional impact." },
  { when: "Current", event: "Work and income context", evidence: "Employment timeline / SSDI records", impact: "TDIU and planning", status: "Missing", detail: "Upload work history, SSDI records, or notes about employment limits if relevant." },
  { when: "Next", event: "VSO conversation", evidence: "Prepared questions and evidence packet", impact: "Action planning", status: "Open", detail: "The app will turn verified facts into questions after this veteran's own records are present." },
];

const conditionMatrix = [
  { condition: "Condition from rating decision", va: "Unknown", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Missing" },
  { condition: "Secondary pathway from evidence", va: "Unknown", ssdi: "Unknown", rating: "N/A", lastExam: "?", worsening: "Investigate", ready: "Missing" },
  { condition: "Residual or complication from records", va: "Unknown", ssdi: "Unknown", rating: "N/A", lastExam: "?", worsening: "Investigate", ready: "Missing" },
];

const secondaryConditions = [
  {
    condition: "Service-connected condition from rating decision",
    rating: "Enter rating",
    pathways: [
      { topic: "Possible secondary pathway", needs: ["Diagnosis", "Treatment records", "Symptom log", "Medical opinion"], questions: ["Which service-connected condition is the starting point?", "What evidence supports this as a discussion topic for a representative?"] },
      { topic: "Possible increase review", needs: ["Current treatment records", "Recent exam", "Functional impact statement", "Symptom frequency"], questions: ["Does the current evidence accurately describe severity?", "Are updated records needed before any representative review?"] },
      { topic: "Possible residual review", needs: ["Hospital or procedure records", "Follow-up records", "Residual symptom documentation", "Provider documentation"], questions: ["Are complications or residuals documented?", "Which records should be gathered before discussing any theory?"] },
    ],
  },
];

const ssdiApplicationPhases = [
  {
    phase: "Before you apply / before the meeting",
    steps: [
      { title: "Gather medical evidence", detail: "Collect VA decisions, C&P exams, private records, hospital records, and records for every limiting condition.", status: "Required" },
      { title: "Build work history", detail: "SSA usually needs jobs from the last 15 years: title, duties, dates, hours, and pay.", status: "Required" },
      { title: "Choose onset date carefully", detail: "The date conditions prevented work affects SSA review and should be tied to records where possible.", status: "Important" },
    ],
  },
  {
    phase: "Applying or retrieving records",
    steps: [
      { title: "Apply online or request SSA records", detail: "Use SSA.gov for applications, or retrieve award/BPQY records to identify the medical basis of an existing award.", status: "Start here" },
      { title: "List every limiting condition", detail: "SSA evaluates combined functional impact. Do not list only one condition if several limit work.", status: "Important" },
      { title: "Ask about veteran handling", detail: "Ask whether any veteran expedited handling applies and document who you spoke with.", status: "Ask" },
    ],
  },
  {
    phase: "After applying / after award",
    steps: [
      { title: "Track all SSA requests", detail: "Missed forms, consultative exams, or deadlines can derail the application.", status: "Important" },
      { title: "Preserve BPQY and award evidence", detail: "These records help explain what SSA recognized, onset dates, Medicare timing, and work history.", status: "Evidence" },
      { title: "Keep VA and SSA separate", detail: "SSDI and VA compensation are separate programs. Evidence may overlap, but rules and decisions differ.", status: "Note" },
    ],
  },
];

const tdiuEvidenceAreas = [
  {
    area: "Current rating picture",
    need: "Latest rating decision with individual ratings and effective dates",
    keywords: /rating|decision|codesheet|code sheet|benefit_summary|benefit summary/i,
    why: "A representative needs the individual ratings, not just the combined rating, to review schedular TDIU thresholds and strategy.",
  },
  {
    area: "Employment history",
    need: "Work timeline, last worked date, job duties, earnings, and attempts to work",
    keywords: /employment|work|job|wage|earnings|resume|timeline/i,
    why: "TDIU review depends heavily on whether service-connected conditions prevent substantially gainful employment.",
  },
  {
    area: "SSDI / SSA context",
    need: "SSDI award letter, BPQY, or SSA medical basis documentation",
    keywords: /ssdi|ssa|bpqy|social security|award/i,
    why: "SSA evidence can help organize functional limitations, while VA and SSA remain separate systems with different rules.",
  },
  {
    area: "Functional impact",
    need: "Personal statement, provider notes, or vocational evidence explaining work limitations",
    keywords: /functional|impact|statement|limitations|unable|employ|vocational/i,
    why: "The strongest conversations are about specific limits: sitting, standing, lifting, concentration, reliability, attendance, and pain flares.",
  },
  {
    area: "Medical evidence",
    need: "Recent treatment notes, exams, medications, therapy, imaging, or specialist records",
    keywords: /medical|treatment|exam|medication|therapy|mri|imaging|neurology|mental|sleep|cpap/i,
    why: "Current records help connect functional limits to service-connected conditions rather than non-service-connected factors.",
  },
  {
    area: "VA forms to ask about",
    need: "VA Form 21-8940 and employer Form 21-4192 discussion with a representative",
    keywords: /21-8940|8940|21-4192|4192|tdiu|unemployability/i,
    why: "These forms are commonly part of TDIU development, but the app should not tell a veteran to file them without accredited review.",
  },
];

const journeyItems = [
  { date: "Service period", title: "Military service", status: "Missing", text: "Upload service records to build this veteran's verified service foundation." },
  { date: "Current", title: "VA benefit status", status: "Missing", text: "Upload benefit summary or rating decision to verify current VA status." },
  { date: "Current", title: "Housing / COE status", status: "Missing", text: "Upload a COE if home loan or funding-fee questions matter." },
  { date: "Current", title: "Evidence packet", status: "Open", text: "Uploaded records will become document explanations, evidence inventory, and representative questions." },
  { date: "Next", title: "Research questions", status: "Open", text: "The app will identify missing evidence and discussion topics from this veteran's own profile." },
];

const briefSections = [
  { title: "Verified story", points: ["Service records, VA letters, medical records, and benefit letters will appear here after upload."] },
  { title: "Benefits already supported", points: ["Verified benefits will be listed only after this veteran's documents are present."] },
  { title: "Open questions", points: ["Missing evidence, unclear eligibility facts, and representative questions will be generated from this veteran's own profile."] },
  { title: "Next conversation", points: ["Ask an accredited representative which evidence to gather next and which possibilities are worth reviewing."] },
];

const schedularStrategies = [
  { title: "No work restriction", text: "Schedular 100% does not require remaining unable to work; it better fits a future consulting/CES path." },
  { title: "VA combined math needs evidence", text: "The app needs the current combined rating, individual ratings, and any new or worsened conditions to create educational examples." },
  { title: "Best review lanes", text: "Post-surgical residuals, secondaries, worsening of current SC conditions, and updated exams." },
];

const vaultDocuments = [
  { name: "Needed: benefit summary or rating decision", tags: ["VA Letter", "Missing"], linked: "Current VA status" },
  { name: "Needed: service verification or DD-214", tags: ["Service", "Missing"], linked: "Service foundation" },
  { name: "Needed: medical records or medication list", tags: ["Medical", "Missing"], linked: "Current treatment picture" },
  { name: "Needed: COE if buying or refinancing", tags: ["Housing", "Missing"], linked: "Home loan entitlement" },
  { name: "Needed: SSDI award/BPQY if applicable", tags: ["SSDI", "Missing"], linked: "SSDI-to-VA mapping" },
  { name: "Needed: employment timeline if work impact matters", tags: ["Employment", "Missing"], linked: "TDIU / work impact" },
];

function statusColor(s: string) {
  const map: Record<string, string> = {
    Complete: "#267a56", Verified: "#267a56", Active: "#267a56", Confirmed: "#267a56", Authorized: "#267a56", Found: "#267a56", Green: "#267a56",
    Missing: "#b6504c", Red: "#b6504c", Insufficient: "#b6504c",
    Unconfirmed: "#b98922", Yellow: "#b98922", Medium: "#b98922", Investigate: "#b98922", High: "#b98922", Partial: "#b98922",
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

function Card({ title, sub, children, badge }: { title: string; sub?: string; children: ReactNode; badge?: string }) {
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

type Doc = { id: string; category: string; file_name: string; status: string; file_path?: string; created_at?: string; };
type Profile = {
  display_name?: string | null;
  branch?: string | null;
  state?: string | null;
  current_rating?: string | null;
  rank_pay_grade?: string | null;
  service_status?: string | null;
  work_status?: string | null;
  dependent_status?: string | null;
  permanent_total_status?: string | null;
  monthly_award?: string | null;
  va_loan_status?: string | null;
  federal_preference_status?: string | null;
  fmp_status?: string | null;
} | null;

function documentLabel(category: string) {
  return documentCategoryLabels[category] || category.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function documentKey(doc: Doc) {
  return `${doc.category}::${doc.file_name.trim().toLowerCase()}`;
}

function dedupeDocuments(documents: Doc[]) {
  const groups = new Map<string, Doc[]>();
  documents.forEach((doc) => {
    const key = documentKey(doc);
    const group = groups.get(key) || [];
    group.push(doc);
    groups.set(key, group);
  });

  return Array.from(groups.values()).map((group) => {
    const sorted = [...group].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    return {
      primary: sorted[0],
      duplicates: sorted.slice(1),
      count: sorted.length,
    };
  });
}

const educationDisclaimer = "Educational use only. Review all potential claims with an accredited VSO, attorney, or VA-accredited representative.";
const vaDataDecoderDisclaimer = "Veteran Journey Navigator is an educational preparation tool. It does not file claims, submit evidence, access VA systems, provide legal advice, or replace an accredited VSO, attorney, or representative. All claim decisions are made solely by the Department of Veterans Affairs.";

type DecodedCondition = {
  id: string;
  condition: string;
  rating: number | null;
  effectiveDate: string;
  staticIndicator: string;
  diagnosticCode: string;
  codeName?: string;
  decision?: string;
  category: string;
  priority: "high" | "medium" | "low";
  evidenceItems: EvidenceItem[];
  notes: string;
};

type EvidenceItem = {
  id: string;
  label: string;
  done: boolean;
};

type DecodedDenial = {
  id: string;
  condition: string;
  diagnosticCode: string;
  codeName?: string;
  category: string;
  reviewLevel: "Representative review" | "Prior denial";
  notes: string;
};

type DecodedClaim = {
  id: string;
  filed: string;
  status: string;
  phase: string;
  developmentLetterSent: boolean;
  decisionLetterSent: boolean;
  evidenceFile?: string;
  evidenceCreated?: string;
  evidenceExpires?: string;
};

type DecodedFormDraft = {
  form: string;
  name: string;
  savedAt?: string;
  expires?: string;
  attemptedSubmit: boolean;
};

type VaDecoderAnalysis = {
  combinedRating: number | null;
  combinedEffectiveDate?: string;
  legalEffectiveDate?: string;
  conditions: DecodedCondition[];
  denials: DecodedDenial[];
  activeClaims: DecodedClaim[];
  formDrafts: DecodedFormDraft[];
};

type ImportAuditItem = {
  id: string;
  fileName: string;
  status: "recognized" | "unsupported" | "error";
  label: string;
  detail: string;
};

const diagnosticCodeDescriptions: Record<string, string> = {
  "6260": "Tinnitus",
  "6847": "Sleep apnea syndromes",
  "9434": "Major depressive disorder",
  "9411": "Posttraumatic stress disorder",
  "5242": "Degenerative arthritis of the spine",
  "5237": "Lumbosacral or cervical strain",
  "8520": "Sciatic nerve paralysis / radiculopathy",
  "7800": "Burn scars or disfigurement of head, face, or neck",
  "7801": "Deep and nonlinear scars",
  "7802": "Superficial nonlinear scars",
  "7804": "Painful or unstable scars",
  "7805": "Other scars / effects of scars",
};

function normalizedObjectValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function displayDate(value?: string | null) {
  if (!value) return "Not found";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function displayDateTime(value?: string | number | null, seconds = false) {
  if (!value) return undefined;
  const date = typeof value === "number" ? new Date(seconds ? value * 1000 : value) : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

function numberFromUnknown(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function pickField(record: Record<string, unknown>, keys: string[]) {
  const normalizedKeys = Object.keys(record);
  const found = normalizedKeys.find((key) => keys.some((candidate) => key.toLowerCase() === candidate.toLowerCase()));
  return found ? record[found] : undefined;
}

function collectObjects(value: unknown, output: Record<string, unknown>[] = []) {
  if (!value || typeof value !== "object") return output;
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjects(item, output));
    return output;
  }
  const record = value as Record<string, unknown>;
  output.push(record);
  Object.values(record).forEach((item) => collectObjects(item, output));
  return output;
}

function mergeAnalyses(base: VaDecoderAnalysis, next: VaDecoderAnalysis): VaDecoderAnalysis {
  const conditionMap = new Map<string, DecodedCondition>();
  [...base.conditions, ...next.conditions].forEach((condition) => conditionMap.set(condition.id || `${condition.condition}-${condition.diagnosticCode}`, condition));
  const denialMap = new Map<string, DecodedDenial>();
  [...base.denials, ...next.denials].forEach((denial) => denialMap.set(denial.id || `${denial.condition}-${denial.diagnosticCode}`, denial));
  const claimMap = new Map<string, DecodedClaim>();
  [...base.activeClaims, ...next.activeClaims].forEach((claim) => claimMap.set(claim.id, claim));
  const draftMap = new Map<string, DecodedFormDraft>();
  [...base.formDrafts, ...next.formDrafts].forEach((draft) => draftMap.set(draft.form, draft));

  return {
    combinedRating: next.combinedRating ?? base.combinedRating,
    combinedEffectiveDate: next.combinedEffectiveDate || base.combinedEffectiveDate,
    legalEffectiveDate: next.legalEffectiveDate || base.legalEffectiveDate,
    conditions: Array.from(conditionMap.values()),
    denials: Array.from(denialMap.values()),
    activeClaims: Array.from(claimMap.values()),
    formDrafts: Array.from(draftMap.values()),
  };
}

function blankVaAnalysis(): VaDecoderAnalysis {
  return { combinedRating: null, conditions: [], denials: [], activeClaims: [], formDrafts: [] };
}

function categoryFromCondition(name: string, code?: string) {
  const text = `${name} ${code || ""}`.toLowerCase();
  if (/sleep|apnea|sinus|respiratory|651|684/.test(text)) return "Respiratory";
  if (/depress|ptsd|anxiety|mental|mood|94/.test(text)) return "Mental health";
  if (/radicul|sciatic|nerve|paralysis|85/.test(text)) return "Neurological";
  if (/spine|lumbar|cervical|neck|back|knee|arthritis|strain|fasciitis|hand|wrist|52|50/.test(text)) return "Musculoskeletal";
  if (/tinnitus|hearing|ear|62|61/.test(text)) return "Auditory";
  if (/skin|scar|barbae|dermat|78/.test(text)) return "Dermatological";
  if (/heart|hypertension|aortic|aneurysm|cardio|70|71/.test(text)) return "Cardiovascular";
  if (/bowel|colon|rectal|stomach|gastro|73/.test(text)) return "Gastrointestinal";
  return "General";
}

function priorityFromCondition(condition: string, rating: number | null, isServiceConnected = true): "high" | "medium" | "low" {
  const text = condition.toLowerCase();
  if (!isServiceConnected && /aneurysm|heart|hypertension|headache|migraine|hearing|nerve/.test(text)) return "high";
  if ((rating ?? 0) >= 30 || /mental|depress|sleep apnea|radicul|nerve/.test(text)) return "high";
  if ((rating ?? 0) >= 10 || /spine|neck|back|knee|tinnitus|hearing/.test(text)) return "medium";
  return "low";
}

function evidenceTemplateForCondition(condition: string, category: string, serviceConnected: boolean): EvidenceItem[] {
  const lower = condition.toLowerCase();
  const base: EvidenceItem[] = [
    { id: "diagnosis", label: serviceConnected ? "Diagnosis or condition recognized in VA data" : "Prior denial identified in VA data", done: true },
  ];
  if (!serviceConnected) {
    return [
      ...base,
      { id: "decision", label: "Prior decision/reasons reviewed", done: false },
      { id: "new-relevant", label: "New and relevant evidence identified", done: false },
      { id: "rep-review", label: "Reviewed with accredited representative", done: false },
    ];
  }
  if (category === "Respiratory") {
    return [...base, { id: "treatment", label: "Current treatment records", done: false }, { id: "device", label: lower.includes("apnea") ? "CPAP or sleep clinic records" : "Specialist treatment records", done: false }, { id: "symptoms", label: "Current symptom statement", done: false }, { id: "functional", label: "Functional impact documented", done: false }];
  }
  if (category === "Mental health") {
    return [...base, { id: "treatment", label: "Current treatment or therapy records", done: false }, { id: "medication", label: "Medication history", done: false }, { id: "occupational", label: "Occupational impact documentation", done: false }, { id: "social", label: "Social or daily-function impact statement", done: false }];
  }
  if (category === "Neurological") {
    return [...base, { id: "exam", label: "Recent neuro exam or specialist notes", done: false }, { id: "imaging", label: "Imaging or nerve study", done: false }, { id: "severity", label: "Symptom frequency and severity statement", done: false }, { id: "functional", label: "Functional limitation documented", done: false }];
  }
  if (category === "Musculoskeletal") {
    return [...base, { id: "imaging", label: "Recent imaging or exam", done: false }, { id: "rom", label: "Range-of-motion or flare-up documentation", done: false }, { id: "treatment", label: "Current treatment records", done: false }, { id: "functional", label: "Functional limitation statement", done: false }];
  }
  if (category === "Auditory") {
    return [...base, { id: "audiology", label: "Recent audiology or ENT records", done: false }, { id: "symptoms", label: "Symptom documentation", done: false }, { id: "related", label: "Related symptoms to discuss with representative", done: false }];
  }
  if (category === "Dermatological") {
    return [...base, { id: "treatment", label: "Active treatment records", done: false }, { id: "photos", label: "Visual documentation", done: false }, { id: "frequency", label: "Flare frequency or medication history", done: false }];
  }
  return [...base, { id: "treatment", label: "Current treatment records", done: false }, { id: "symptoms", label: "Current symptom statement", done: false }, { id: "functional", label: "Functional impact documented", done: false }];
}

function conditionNote(condition: DecodedCondition) {
  const rating = condition.rating !== null ? `${condition.rating}%` : "non-compensable or not shown";
  const staticText = condition.staticIndicator === "Yes" ? "marked static in the imported VA data" : condition.staticIndicator === "No" ? "not marked static in the imported VA data" : "static status not found";
  return `${condition.condition} is listed as service connected at ${rating}, effective ${condition.effectiveDate}. It is ${staticText}. Use this row to organize evidence and questions for an accredited representative.`;
}

function denialNote(denial: DecodedDenial) {
  if (denial.reviewLevel === "Representative review") {
    return "Prior denial found. This is a locked-door topic, not a fresh unexplored room. Ask an accredited representative what evidence or procedural path would be required before taking action.";
  }
  return "Prior denial found. Keep it separate from new opportunity rooms and review the original denial reason before any next step.";
}

function decodeRatedDisabilities(value: unknown): VaDecoderAnalysis {
  const attrs = (value as { data?: { attributes?: Record<string, unknown> } })?.data?.attributes;
  const rows = Array.isArray(attrs?.individual_ratings) ? attrs.individual_ratings as Record<string, unknown>[] : [];
  if (!attrs || !rows.length) return blankVaAnalysis();

  const conditions: DecodedCondition[] = [];
  const denials: DecodedDenial[] = [];
  rows.forEach((row, index) => {
    const decision = normalizedObjectValue(row.decision);
    const name = normalizedObjectValue(row.diagnostic_text || row.diagnostic_type_name || row.name || row.condition);
    if (!name) return;
    const code = normalizedObjectValue(row.diagnostic_type_code || row.hyph_diagnostic_type_code || row.code).match(/\d{4}/)?.[0] || "Not found";
    const category = categoryFromCondition(name, code);
    const id = normalizedObjectValue(row.disability_rating_id) || `${name}-${code}-${index}`;
    if (/service connected/i.test(decision) && !/^not service connected$/i.test(decision)) {
      const rating = numberFromUnknown(row.rating_percentage);
      const condition: DecodedCondition = {
        id,
        condition: name.replace(/\b\w/g, (letter) => letter.toUpperCase()),
        rating,
        effectiveDate: displayDate(normalizedObjectValue(row.effective_date)),
        staticIndicator: typeof row.static_ind === "boolean" ? (row.static_ind ? "Yes" : "No") : "Unknown",
        diagnosticCode: code,
        codeName: normalizedObjectValue(row.diagnostic_type_name),
        decision,
        category,
        priority: priorityFromCondition(name, rating, true),
        evidenceItems: evidenceTemplateForCondition(name, category, true),
        notes: "",
      };
      condition.notes = conditionNote(condition);
      conditions.push(condition);
    } else if (/not service connected|denied/i.test(decision)) {
      const reviewLevel = priorityFromCondition(name, null, false) === "high" ? "Representative review" : "Prior denial";
      const denial: DecodedDenial = {
        id,
        condition: name.replace(/\b\w/g, (letter) => letter.toUpperCase()),
        diagnosticCode: code,
        codeName: normalizedObjectValue(row.diagnostic_type_name),
        category,
        reviewLevel,
        notes: "",
      };
      denial.notes = denialNote(denial);
      denials.push(denial);
    }
  });

  return {
    combinedRating: numberFromUnknown(attrs.combined_disability_rating),
    combinedEffectiveDate: displayDate(normalizedObjectValue(attrs.combined_effective_date)),
    legalEffectiveDate: displayDate(normalizedObjectValue(attrs.legal_effective_date)),
    conditions,
    denials,
    activeClaims: [],
    formDrafts: [],
  };
}

function humanizeClaimPhase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function decodeClaims(value: unknown): VaDecoderAnalysis {
  const rows = Array.isArray((value as { data?: unknown }).data) ? (value as { data: Record<string, unknown>[] }).data : [];
  const activeClaims = rows.flatMap((claim) => {
    const attrs = claim.attributes as Record<string, unknown> | undefined;
    if (!attrs) return [];
    const closeDate = normalizedObjectValue(attrs.closeDate);
    const status = normalizedObjectValue(attrs.status);
    if (closeDate || /complete/i.test(status)) return [];
    const phaseDates = attrs.claimPhaseDates as Record<string, unknown> | undefined;
    const submissions = Array.isArray(attrs.evidenceSubmissions) ? attrs.evidenceSubmissions as Record<string, unknown>[] : [];
    const submission = submissions[0];
    return [{
      id: normalizedObjectValue(claim.id || attrs.id),
      filed: displayDate(normalizedObjectValue(attrs.claimDate)),
      status: status || "Active",
      phase: humanizeClaimPhase(normalizedObjectValue(phaseDates?.phaseType) || "Active claim"),
      developmentLetterSent: Boolean(attrs.developmentLetterSent),
      decisionLetterSent: Boolean(attrs.decisionLetterSent),
      evidenceFile: normalizedObjectValue(submission?.file_name),
      evidenceCreated: displayDateTime(normalizedObjectValue(submission?.created_at)),
      evidenceExpires: displayDateTime(normalizedObjectValue(submission?.delete_date)),
    }];
  });
  return { ...blankVaAnalysis(), activeClaims };
}

function decodeProfileDrafts(value: unknown): VaDecoderAnalysis {
  const attrs = (value as { data?: { attributes?: Record<string, unknown> } })?.data?.attributes;
  const forms = Array.isArray(attrs?.in_progress_forms) ? attrs.in_progress_forms as Record<string, unknown>[] : [];
  const formDrafts = forms.flatMap((form) => {
    const formId = normalizedObjectValue(form.form);
    if (!formId) return [];
    const metadata = form.metadata as Record<string, unknown> | undefined;
    const submission = metadata?.submission as Record<string, unknown> | undefined;
    return [{
      form: formId,
      name: formId === "21-8940" ? "VA Form 21-8940 (TDIU / IU application)" : `VA Form ${formId}`,
      savedAt: displayDateTime(metadata?.saved_at as number | undefined),
      expires: displayDateTime(form.expiresAt as number | undefined, true),
      attemptedSubmit: Boolean(submission?.has_attempted_submit),
    }];
  });
  return { ...blankVaAnalysis(), formDrafts };
}

function decodeVaJson(value: unknown): VaDecoderAnalysis {
  let analysis = mergeAnalyses(blankVaAnalysis(), decodeRatedDisabilities(value));
  analysis = mergeAnalyses(analysis, decodeClaims(value));
  analysis = mergeAnalyses(analysis, decodeProfileDrafts(value));
  if (analysis.conditions.length || analysis.denials.length || analysis.activeClaims.length || analysis.formDrafts.length || analysis.combinedRating !== null) return analysis;

  const records = collectObjects(value);
  const combinedCandidates = ["combinedRating", "combinedDisabilityRating", "combinedEvaluation", "totalCombinedRating", "combinedPercentage", "combined_percent", "combined_rating"];
  let combinedRating: number | null = null;
  for (const record of records) {
    const candidate = pickField(record, combinedCandidates);
    const parsed = numberFromUnknown(candidate);
    if (parsed !== null && parsed >= 0 && parsed <= 100) {
      combinedRating = parsed;
      break;
    }
  }

  const conditionKeys = ["condition", "conditionName", "disabilityName", "disability", "name", "issue", "description", "diagnosis"];
  const ratingKeys = ["rating", "ratingPercentage", "disabilityRating", "evaluation", "evaluationPercentage", "percent", "percentage", "evaluationPercent"];
  const effectiveKeys = ["effectiveDate", "awardEffectiveDate", "beginDate", "startDate", "date", "serviceConnectionDate"];
  const staticKeys = ["static", "staticIndicator", "isStatic", "staticDisability", "futureExamIndicator"];
  const codeKeys = ["diagnosticCode", "diagnostic_code", "code", "dc", "diagnostic"];

  const seen = new Set<string>();
  const conditions = records.flatMap((record) => {
    const name = normalizedObjectValue(pickField(record, conditionKeys));
    const rating = numberFromUnknown(pickField(record, ratingKeys));
    const effectiveDate = normalizedObjectValue(pickField(record, effectiveKeys));
    const diagnosticCode = normalizedObjectValue(pickField(record, codeKeys)).match(/\d{4}/)?.[0] || "";
    const staticRaw = pickField(record, staticKeys);
    const hasConditionShape = name && (rating !== null || effectiveDate || diagnosticCode);
    if (!hasConditionShape || name.length > 90) return [];
    const staticIndicator = typeof staticRaw === "boolean"
      ? (staticRaw ? "Yes" : "No")
      : normalizedObjectValue(staticRaw) || "Unknown";
    const key = `${name.toLowerCase()}::${rating ?? ""}::${effectiveDate}::${diagnosticCode}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const category = categoryFromCondition(name, diagnosticCode);
    const condition: DecodedCondition = {
      id: key,
      condition: name,
      rating,
      effectiveDate: effectiveDate || "Not found",
      staticIndicator,
      diagnosticCode: diagnosticCode || "Not found",
      category,
      priority: priorityFromCondition(name, rating, true),
      evidenceItems: evidenceTemplateForCondition(name, category, true),
      notes: "",
    };
    condition.notes = conditionNote(condition);
    return [condition];
  });

  return { ...blankVaAnalysis(), combinedRating, conditions };
}

function parseJsonBlocks(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  try {
    return [JSON.parse(trimmed)];
  } catch {
    const blocks = trimmed.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
    if (blocks.length <= 1) throw new Error("Invalid JSON");
    return blocks.map((block) => JSON.parse(block));
  }
}

function auditImportedJson(fileName: string, analysis: VaDecoderAnalysis): ImportAuditItem {
  const recognized = analysis.conditions.length || analysis.denials.length || analysis.activeClaims.length || analysis.formDrafts.length || analysis.combinedRating !== null;
  const lower = fileName.toLowerCase();
  if (analysis.conditions.length || analysis.denials.length) {
    return {
      id: `${fileName}-${Date.now()}-rated`,
      fileName,
      status: "recognized",
      label: lower.includes("rated") ? "Rated disabilities imported" : "VA disability data imported",
      detail: `${analysis.conditions.length} service-connected conditions and ${analysis.denials.length} prior denials found`,
    };
  }
  if (analysis.activeClaims.length) {
    return {
      id: `${fileName}-${Date.now()}-claims`,
      fileName,
      status: "recognized",
      label: lower.includes("claim") ? "Claims imported" : "VA claim data imported",
      detail: `${analysis.activeClaims.length} active claim${analysis.activeClaims.length === 1 ? "" : "s"} found`,
    };
  }
  if (analysis.formDrafts.length) {
    return {
      id: `${fileName}-${Date.now()}-profile`,
      fileName,
      status: "recognized",
      label: lower.includes("profile") ? "Profile imported" : "VA profile data imported",
      detail: `${analysis.formDrafts.length} saved form draft${analysis.formDrafts.length === 1 ? "" : "s"} found; profile PII ignored`,
    };
  }
  if (recognized) {
    return {
      id: `${fileName}-${Date.now()}-summary`,
      fileName,
      status: "recognized",
      label: "VA summary imported",
      detail: "Combined rating found",
    };
  }
  return {
    id: `${fileName}-${Date.now()}-unsupported`,
    fileName,
    status: "unsupported",
    label: "Not recognized",
    detail: "No rated disabilities, active claims, or saved form drafts were found",
  };
}

function combineVaRatings(ratings: number[]) {
  const sorted = [...ratings].filter((rating) => rating > 0).sort((a, b) => b - a);
  let raw = 0;
  const steps = sorted.map((rating) => {
    const before = raw;
    raw = before + (100 - before) * (rating / 100);
    return { rating, before: Math.round(before), after: Math.round(raw) };
  });
  const rounded = sorted.length ? Math.round(raw / 10) * 10 : 0;
  return { sorted, raw: Math.round(raw), rounded: Math.min(100, rounded), steps };
}

function dateMilestoneStatus(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return [];
  const now = new Date();
  const years = (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return [5, 10, 20].flatMap((year) => {
    if (years >= year) return [`Reached ${year}-year mark`];
    if (years >= year - 1) return [`Approaching ${year}-year mark`];
    return [];
  });
}

function diagnosticDescription(code: string) {
  return diagnosticCodeDescriptions[code] || "Description not built in yet. Discuss the code with an accredited representative or compare against VA rating schedule references.";
}

export function VADataDecoder({ documents = [] }: { documents?: Doc[] }) {
  const [rawJson, setRawJson] = useState("");
  const [decoded, setDecoded] = useState<VaDecoderAnalysis | null>(null);
  const [parseError, setParseError] = useState("");
  const [decoderTab, setDecoderTab] = useState<"matrix" | "denials" | "math">("matrix");
  const [openConditionId, setOpenConditionId] = useState<string | null>(null);
  const [openDenialId, setOpenDenialId] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<"all" | "high" | "gaps">("all");
  const [evidenceOverrides, setEvidenceOverrides] = useState<Record<string, Record<string, boolean>>>({});
  const [whatChanged, setWhatChanged] = useState<Record<string, string>>({});
  const [importAudit, setImportAudit] = useState<ImportAuditItem[]>([]);

  function analyzeText(text: string) {
    setParseError("");
    try {
      const blocks = parseJsonBlocks(text);
      const analyses = blocks.map((block) => decodeVaJson(block));
      const result = analyses.reduce((analysis, block) => mergeAnalyses(analysis, block), blankVaAnalysis());
      setDecoded((previous) => mergeAnalyses(previous || blankVaAnalysis(), result));
      setImportAudit((previous) => [...previous, ...analyses.map((analysis, index) => auditImportedJson(`Pasted JSON block ${index + 1}`, analysis))]);
      setRawJson(text);
    } catch {
      setParseError("Could not parse JSON. Check that the data begins with { or [ and contains valid JSON syntax.");
    }
  }

  function handleFiles(files?: FileList | null) {
    if (!files?.length) return;
    setParseError("");
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || "");
          const result = decodeVaJson(JSON.parse(text));
          setDecoded((previous) => mergeAnalyses(previous || blankVaAnalysis(), result));
          setImportAudit((previous) => [...previous, auditImportedJson(file.name, result)]);
          setRawJson((previous) => previous ? `${previous}\n\n${text}` : text);
        } catch {
          setImportAudit((previous) => [...previous, { id: `${file.name}-${Date.now()}-error`, fileName: file.name, status: "error", label: "Could not parse", detail: "This file is not valid JSON or could not be read" }]);
          setParseError(`Could not parse ${file.name}. Check that it is a valid JSON file.`);
        }
      };
      reader.readAsText(file);
    });
  }

  function clearDecoder() {
    setRawJson("");
    setDecoded(null);
    setParseError("");
    setEvidenceOverrides({});
    setWhatChanged({});
    setImportAudit([]);
  }

  function exportAnalysis() {
    const payload = { exportedAt: new Date().toISOString(), disclaimer: vaDataDecoderDisclaimer, whatChanged, analysis: decoded };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "va-data-decoder-analysis.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportVeteranSnapshot() {
    const lines = [
      "Veteran Journey Navigator - VA Decoder Snapshot",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      vaDataDecoderDisclaimer,
      "",
      "CURRENT STATUS",
      `Combined rating: ${displayedCombined !== null ? `${displayedCombined}%` : "Not found"}`,
      `Service-connected conditions: ${conditions.length}`,
      `Static conditions: ${staticConditions.length}`,
      `Prior denials: ${denials.length}`,
      `Active claims: ${activeClaims.length}`,
      "",
      "SERVICE-CONNECTED CONDITIONS",
      ...(conditions.length ? conditions.map((condition) => `- ${condition.condition}: ${condition.rating !== null ? `${condition.rating}%` : "N/A"}, effective ${condition.effectiveDate}, static: ${condition.staticIndicator}, code ${condition.diagnosticCode}`) : ["- Not imported"]),
      "",
      "STATIC CONDITIONS",
      ...(staticConditions.length ? staticConditions.map((condition) => `- ${condition.condition}`) : ["- None decoded"]),
      "",
      "PRIOR DENIALS",
      ...(denials.length ? denials.map((denial) => `- ${denial.condition}: ${denial.category}, code ${denial.diagnosticCode}, ${denial.reviewLevel}`) : ["- None decoded"]),
      "",
      "ACTIVE CLAIMS",
      ...(activeClaims.length ? activeClaims.map((claim) => `- Claim ${claim.id}: ${claim.phase}, filed ${claim.filed}`) : ["- None decoded"]),
      "",
      "DISCUSSION TOPICS FOR VSO",
      ...(opportunityTopics.length ? opportunityTopics.map((topic) => `- ${topic}`) : ["- Import VA data to generate discussion topics"]),
      "",
      "WHAT CHANGED",
      ...(Object.entries(whatChanged).filter(([, value]) => value.trim()).length
        ? Object.entries(whatChanged).filter(([, value]) => value.trim()).map(([id, value]) => `- ${conditions.find((condition) => condition.id === id)?.condition || "Condition"}: ${value}`)
        : ["- No changes entered yet"]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "va-decoder-veteran-snapshot.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function itemDone(condition: DecodedCondition, item: EvidenceItem) {
    return evidenceOverrides[condition.id]?.[item.id] ?? item.done;
  }

  function toggleEvidence(conditionId: string, itemId: string, currentValue: boolean) {
    setEvidenceOverrides((previous) => ({
      ...previous,
      [conditionId]: {
        ...(previous[conditionId] || {}),
        [itemId]: !currentValue,
      },
    }));
  }

  function readiness(condition: DecodedCondition) {
    if (!condition.evidenceItems.length) return 0;
    const done = condition.evidenceItems.filter((item) => itemDone(condition, item)).length;
    return Math.round((done / condition.evidenceItems.length) * 100);
  }

  function readinessColor(score: number) {
    if (score >= 75) return { bg: "#dff3e7", bar: "#267a56", text: "#267a56" };
    if (score >= 40) return { bg: "#fbefd0", bar: "#b98922", text: "#8a6319" };
    return { bg: "#f8e2df", bar: "#b6504c", text: "#b6504c" };
  }

  const conditions = decoded?.conditions || [];
  const denials = decoded?.denials || [];
  const activeClaims = decoded?.activeClaims || [];
  const formDrafts = decoded?.formDrafts || [];
  const ratings = conditions.map((condition) => condition.rating).filter((rating): rating is number => typeof rating === "number");
  const combinedMath = combineVaRatings(ratings);
  const displayedCombined = decoded?.combinedRating ?? (ratings.length ? combinedMath.rounded : null);
  const datedConditions = conditions.filter((condition) => !Number.isNaN(new Date(condition.effectiveDate).getTime()));
  const oldest = [...datedConditions].sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime()).slice(0, 3);
  const newest = [...datedConditions].sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()).slice(0, 3);
  const diagnosticCodes = Array.from(new Set(conditions.map((condition) => condition.diagnosticCode).filter((code) => code && code !== "Not found")));
  const overallReadiness = conditions.length ? Math.round(conditions.reduce((sum, condition) => sum + readiness(condition), 0) / conditions.length) : 0;
  const filteredConditions = conditions.filter((condition) => {
    if (conditionFilter === "high") return condition.priority === "high";
    if (conditionFilter === "gaps") return readiness(condition) < 50;
    return true;
  });
  const representativeReviewDenials = denials.filter((denial) => denial.reviewLevel === "Representative review");
  const otherDenials = denials.filter((denial) => denial.reviewLevel !== "Representative review");
  const staticConditions = conditions.filter((condition) => condition.staticIndicator === "Yes");
  const nonStaticConditions = conditions.filter((condition) => condition.staticIndicator === "No");
  const lastImported = importAudit.length ? new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "Not imported yet";
  const opportunityTypeRows = [
    { type: "Increase Review", count: conditions.length, detail: "Service-connected conditions that can be organized for severity and evidence review." },
    { type: "Prior Denial", count: denials.length, detail: "Previously denied conditions; keep separate from new opportunity rooms." },
    { type: "Pending Claim", count: activeClaims.length, detail: "Open VA claims found in the imported claims data." },
    { type: "Saved Form / Draft", count: formDrafts.length, detail: "VA forms started in the imported profile data." },
    { type: "New Claim", count: 0, detail: "Not inferred from VA JSON. Requires accredited review and veteran intent." },
    { type: "Appeal / Supplemental / HLR", count: 0, detail: "Not decoded yet. Future imports can add appeals and review lanes." },
  ];
  const opportunityTopics = [
    conditions.some((condition) => /tinnitus/i.test(condition.condition)) ? "Headache, migraine, vertigo, or balance symptoms as discussion topics related to tinnitus evidence" : "",
    conditions.some((condition) => /depression|ptsd|anxiety|mental/i.test(condition.condition)) ? "Mental health evaluation accuracy, occupational impairment, social impairment, and current treatment evidence" : "",
    conditions.some((condition) => /lumbar|cervical|spine|back|neck/i.test(condition.condition)) ? "Spine progression, range of motion, flare-ups, functional loss, and neurological symptoms" : "",
    conditions.some((condition) => /radiculopathy|sciatic|nerve/i.test(condition.condition)) ? "Radiculopathy progression, laterality, nerve studies, falls, weakness, or assistive device evidence" : "",
    conditions.some((condition) => /sleep apnea|apnea/i.test(condition.condition)) ? "Sleep apnea treatment records, CPAP records, fatigue, and functional impact documentation" : "",
    conditions.length ? "Whether the current evidence accurately reflects severity, effective dates, and missing documentation" : "",
  ].filter(Boolean);
  const evidenceChecklist = [
    { label: "Diagnosis", found: conditions.length > 0 },
    { label: "Treatment Records", found: documents.some((doc) => /medical|treatment|record|surgery|medication/i.test(`${doc.file_name} ${doc.category}`)) },
    { label: "Symptom Log", found: documents.some((doc) => /symptom|log|statement|personal/i.test(`${doc.file_name} ${doc.category}`)) },
    { label: "Personal Statement", found: documents.some((doc) => /personal|statement/i.test(`${doc.file_name} ${doc.category}`)) },
    { label: "Functional Impact Statement", found: Object.values(whatChanged).some(Boolean) || documents.some((doc) => /functional|impact|work|employment/i.test(`${doc.file_name} ${doc.category}`)) },
    { label: "Diagnostic Codes", found: diagnosticCodes.length > 0 },
  ];
  const packetSections = [
    { title: "Current Ratings", lines: [`Combined rating: ${displayedCombined !== null ? `${displayedCombined}%` : "Not found"}`, `Conditions reviewed: ${conditions.length}`] },
    { title: "Effective Dates", lines: datedConditions.slice(0, 5).map((condition) => `${condition.condition}: ${condition.effectiveDate}`) },
    { title: "Questions For My VSO", lines: opportunityTopics.slice(0, 5) },
    { title: "Documents Available", lines: documents.length ? documents.map((doc) => documentLabel(doc.category)).slice(0, 5) : ["No uploaded vault documents detected"] },
    { title: "Documents Missing", lines: evidenceChecklist.filter((item) => !item.found).map((item) => item.label) },
    { title: "What Changed", lines: Object.entries(whatChanged).filter(([, value]) => value.trim()).slice(0, 5).map(([id, value]) => `${conditions.find((condition) => condition.id === id)?.condition || "Condition"}: ${value}`) },
    { title: "Next Actions", lines: ["Verify decoded fields against the original VA source", "Bring the packet to an accredited representative", "Do not enter VA credentials into this app"] },
  ];
  const overallColors = readinessColor(overallReadiness);

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card title="VA Data Decoder" sub="Experimental plain-English decoder for VA disability JSON or data exports the veteran already downloaded." badge="Experimental">
        <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
          <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Credentials never belong here</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>Only upload data you personally downloaded from your VA account. Never enter your VA login credentials into this application.</p>
          <p style={{ margin: "4px 0 0", color: "#8a6319", fontSize: 11, lineHeight: 1.45 }}>{vaDataDecoderDisclaimer}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 10, marginBottom: 12 }} className="nonVaLaneGrid">
          <div>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 5 }}>Paste VA JSON data</span>
              <textarea value={rawJson} onChange={(event) => setRawJson(event.target.value)} placeholder='Paste one VA JSON export here, or upload rated_disabilities, benefits_claims, and user_profile JSON files together.' style={{ width: "100%", minHeight: 150, border: "1px solid #d9dfd5", borderRadius: 8, padding: 10, fontSize: 12, resize: "vertical" as const, boxSizing: "border-box" as const }} />
            </label>
            {parseError ? <p style={{ color: "#b6504c", fontSize: 12, margin: "6px 0 0" }}>{parseError}</p> : null}
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
            <strong style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Import controls</strong>
            <input type="file" accept="application/json,.json" multiple onChange={(event) => handleFiles(event.target.files)} style={{ fontSize: 12, marginBottom: 10, maxWidth: "100%" }} />
            <button type="button" onClick={() => analyzeText(rawJson)} style={{ width: "100%", minHeight: 36, border: "1px solid #267a56", borderRadius: 8, background: "#dff3e7", color: "#267a56", fontWeight: 850, cursor: "pointer", marginBottom: 8 }}>Analyze JSON</button>
            <button type="button" onClick={clearDecoder} style={{ width: "100%", minHeight: 34, border: "1px solid #d9dfd5", borderRadius: 8, background: "#fff", color: "#b6504c", fontWeight: 800, cursor: "pointer", marginBottom: 8 }}>Delete analysis results</button>
            <button type="button" onClick={exportAnalysis} disabled={!decoded} style={{ width: "100%", minHeight: 34, border: "1px solid #d9dfd5", borderRadius: 8, background: decoded ? "#fff" : "#f4f6f3", color: decoded ? "#172132" : "#667184", fontWeight: 800, cursor: decoded ? "pointer" : "not-allowed" }}>Export my decoded analysis</button>
            <p style={{ margin: "8px 0 0", color: "#667184", fontSize: 11, lineHeight: 1.4 }}>This version analyzes in the browser session. Future local/offline mode can keep analysis fully on-device.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }} className="nonVaStatsGrid">
          {[
            { label: "Combined rating", value: displayedCombined !== null ? `${displayedCombined}%` : "Not found" },
            { label: "Conditions found", value: String(conditions.length) },
            { label: "Prior denials", value: String(denials.length) },
            { label: "Active claims", value: String(activeClaims.length) },
          ].map((item) => (
            <div key={item.label} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
              <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>{item.label}</span>
              <div style={{ fontSize: 22, fontWeight: 950, lineHeight: 1.15, marginTop: 4 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Import Audit Panel" sub="Confidence check for each VA JSON source loaded in this browser session." badge={`${importAudit.length} imports`}>
        {importAudit.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }} className="nonVaLaneGrid">
            {importAudit.map((item) => (
              <div key={item.id} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: "10px 12px", background: item.status === "recognized" ? "#f9fbf7" : item.status === "error" ? "#f8e2df" : "#fbefd0" }}>
                <strong style={{ display: "flex", gap: 6, alignItems: "center", color: item.status === "recognized" ? "#267a56" : item.status === "error" ? "#b6504c" : "#8a6319", fontSize: 12 }}>
                  <span>{item.status === "recognized" ? "✓" : item.status === "error" ? "✗" : "!"}</span>
                  {item.fileName}
                </strong>
                <p style={{ margin: "5px 0 0", color: "#172132", fontSize: 12, fontWeight: 800 }}>{item.label}</p>
                <p style={{ margin: "2px 0 0", color: "#667184", fontSize: 11, lineHeight: 1.4 }}>{item.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#667184", fontSize: 12 }}>Upload or paste VA JSON to see which source files were recognized and what each one contributed.</p>
        )}
      </Card>

      <Card title="VA Data Health Check" sub="What the imported VA data says right now. Educational preparation only." badge="Status snapshot">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaStatsGrid">
          {[
            { label: "Service Connected", value: String(conditions.length) },
            { label: "Prior Denials", value: String(denials.length) },
            { label: "Pending Claims", value: String(activeClaims.length) },
            { label: "Static Conditions", value: String(staticConditions.length) },
            { label: "Last Imported", value: lastImported },
          ].map((item) => (
            <div key={item.label} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
              <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>{item.label}</span>
              <div style={{ fontSize: item.label === "Last Imported" ? 13 : 24, fontWeight: 950, lineHeight: 1.15, marginTop: 4 }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }} className="nonVaLaneGrid">
          {opportunityTypeRows.map((row) => (
            <div key={row.type} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: "9px 11px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ fontSize: 12 }}>{row.type}</strong>
                <Pill label={String(row.count)} />
              </div>
              <p style={{ margin: "4px 0 0", color: "#667184", fontSize: 11, lineHeight: 1.4 }}>{row.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Static Condition Analyzer" sub="Static indicators decoded from veteran-provided VA data. This is not protection or reduction advice." badge={`${staticConditions.length} static`}>
        {conditions.length ? (
          <>
            <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 10 }}>
              <strong style={{ color: "#8a6319", fontSize: 12 }}>{nonStaticConditions.length ? "Some conditions are not marked static" : "All decoded service-connected conditions appear static"}</strong>
              <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12 }}>Static in VA data does not automatically mean legally protected. Ask an accredited representative about 5-year, 10-year, 20-year, P&T, and reduction-protection rules.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 7 }} className="nonVaLaneGrid">
              {conditions.map((condition) => (
                <div key={`${condition.id}-static`} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: "9px 11px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ fontSize: 12 }}>{condition.condition}</strong>
                    <Pill label={condition.staticIndicator === "Yes" ? "Static" : condition.staticIndicator === "No" ? "Not static" : "Unknown"} />
                  </div>
                  <p style={{ margin: "3px 0 0", color: "#667184", fontSize: 11 }}>{condition.rating !== null ? `${condition.rating}%` : "Rating not shown"} - Effective {condition.effectiveDate}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ margin: 0, color: "#667184", fontSize: 12 }}>Upload rated disabilities JSON to decode static indicators.</p>
        )}
      </Card>

      {(activeClaims.length || formDrafts.length) ? (
        <Card title="Claim Status Banner" sub="Imported from veteran-provided VA JSON. Verify against VA.gov." badge="Current VA data">
          {activeClaims.map((claim) => (
            <div key={claim.id} style={{ border: "1px solid #8bb8e8", borderRadius: 8, padding: "10px 12px", background: "#e6f1fb", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" as const }}>
                <strong style={{ color: "#185fa5", fontSize: 13 }}>Active claim ID {claim.id}</strong>
                <Pill label={claim.phase} />
              </div>
              <p style={{ margin: "5px 0 0", color: "#185fa5", fontSize: 12 }}>Filed {claim.filed}. Development letter: {claim.developmentLetterSent ? "sent" : "not shown"}. Decision letter: {claim.decisionLetterSent ? "sent" : "not sent"}.</p>
              {claim.evidenceFile ? <p style={{ margin: "5px 0 0", color: "#185fa5", fontSize: 12 }}>Evidence uploaded: <strong>{claim.evidenceFile}</strong>{claim.evidenceCreated ? ` on ${claim.evidenceCreated}` : ""}{claim.evidenceExpires ? `. VA system delete date shown: ${claim.evidenceExpires}` : ""}.</p> : null}
            </div>
          ))}
          {formDrafts.map((draft) => (
            <div key={draft.form} style={{ border: "1px solid #f7c1c1", borderRadius: 8, padding: "10px 12px", background: "#f8e2df", marginBottom: 8 }}>
              <strong style={{ color: "#a32d2d", fontSize: 13 }}>{draft.name} saved draft</strong>
              <p style={{ margin: "5px 0 0", color: "#793030", fontSize: 12 }}>{draft.savedAt ? `Saved ${draft.savedAt}. ` : ""}{draft.attemptedSubmit ? "A submission attempt appears in the imported VA data. " : ""}{draft.expires ? `Draft expiration shown: ${draft.expires}. ` : ""}Confirm intent with an accredited representative.</p>
            </div>
          ))}
        </Card>
      ) : null}

      <Card title="Evidence Matrix v2" sub="Service-connected conditions, prior denials, and VA math from veteran-provided VA JSON." badge="Import-driven">
        <div style={{ display: "flex", gap: 5, marginBottom: 14, background: "#f4f6f3", padding: 4, borderRadius: 8 }}>
          {[
            ["matrix", "Evidence Matrix"],
            ["denials", "Prior Denials"],
            ["math", "VA Math"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setDecoderTab(id as "matrix" | "denials" | "math")} style={{ flex: 1, minHeight: 34, border: "0", borderRadius: 6, background: decoderTab === id ? "#fff" : "transparent", color: decoderTab === id ? "#172132" : "#667184", fontWeight: 850, cursor: "pointer", boxShadow: decoderTab === id ? "0 1px 2px rgba(0,0,0,.08)" : "none" }}>{label}</button>
          ))}
        </div>

        {decoderTab === "matrix" ? (
          <div>
            <div style={{ background: overallColors.bg, border: `1px solid ${overallColors.bar}44`, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block", color: overallColors.text, fontSize: 12, textTransform: "uppercase" as const }}>Evidence completeness</strong>
                  <span style={{ fontSize: 30, fontWeight: 950, color: overallColors.text }}>{overallReadiness}%</span>
                </div>
                <div style={{ textAlign: "right" as const, color: overallColors.text, fontSize: 12 }}>
                  <div>{conditions.length} service-connected conditions</div>
                  <div>{conditions.filter((condition) => readiness(condition) < 50).length} rows need evidence work</div>
                  <div>Combined rating: {displayedCombined !== null ? `${displayedCombined}%` : "not found"}</div>
                </div>
              </div>
              <div style={{ height: 8, background: "#fff9", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
                <div style={{ width: `${overallReadiness}%`, height: "100%", background: overallColors.bar }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" as const }}>
              {[
                ["all", "All conditions"],
                ["high", "High priority"],
                ["gaps", "Evidence gaps"],
              ].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setConditionFilter(id as "all" | "high" | "gaps")} style={{ minHeight: 30, padding: "0 11px", border: "1px solid #d9dfd5", borderRadius: 7, background: conditionFilter === id ? "#172132" : "#fff", color: conditionFilter === id ? "#fff" : "#667184", cursor: "pointer", fontWeight: 800 }}>{label}</button>
              ))}
            </div>

            {filteredConditions.length ? filteredConditions.map((condition) => {
              const score = readiness(condition);
              const colors = readinessColor(score);
              const open = openConditionId === condition.id;
              const doneCount = condition.evidenceItems.filter((item) => itemDone(condition, item)).length;
              return (
                <div key={condition.id} style={{ border: open ? `1px solid ${colors.bar}` : "1px solid #d9dfd5", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
                  <button type="button" onClick={() => setOpenConditionId(open ? null : condition.id)} style={{ width: "100%", border: 0, background: "#fff", padding: "11px 13px", cursor: "pointer", textAlign: "left" as const }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const }}>
                      <strong style={{ flex: 1, minWidth: 180, fontSize: 13 }}>{condition.condition}</strong>
                      <span style={{ color: "#267a56", fontWeight: 900 }}>{condition.rating !== null ? `${condition.rating}%` : "N/A"}</span>
                      <Pill label={condition.priority === "high" ? "High" : condition.priority === "medium" ? "Medium" : "Low"} />
                      <Pill label={condition.staticIndicator === "Yes" ? "Static" : condition.staticIndicator === "No" ? "Not static" : "Static unknown"} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#edf0ea", overflow: "hidden" }}>
                        <div style={{ width: `${score}%`, height: "100%", background: colors.bar }} />
                      </div>
                      <span style={{ color: colors.text, fontSize: 12, fontWeight: 900 }}>{score}% ready</span>
                      <span style={{ color: "#667184", fontSize: 11 }}>{doneCount}/{condition.evidenceItems.length}</span>
                    </div>
                  </button>
                  {open ? (
                    <div style={{ borderTop: "1px solid #edf0ea", padding: "11px 13px", background: "#f9fbf7" }}>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, color: "#667184", fontSize: 12, marginBottom: 10 }}>
                        <span>Code: {condition.diagnosticCode}</span>
                        <span>Effective: {condition.effectiveDate}</span>
                        <span>{condition.category}</span>
                        {condition.codeName ? <span>{condition.codeName}</span> : null}
                      </div>
                      <p style={{ margin: "0 0 10px", color: "#667184", fontSize: 12, lineHeight: 1.5 }}>{condition.notes}</p>
                      {condition.evidenceItems.map((item) => {
                        const done = itemDone(condition, item);
                        return (
                          <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderTop: "1px solid #edf0ea", cursor: "pointer" }}>
                            <input type="checkbox" checked={done} onChange={() => toggleEvidence(condition.id, item.id, done)} />
                            <span style={{ flex: 1, fontSize: 12, color: done ? "#667184" : "#172132" }}>{item.label}</span>
                            <Pill label={done ? "Found" : "Missing"} />
                          </label>
                        );
                      })}
                      <label style={{ display: "block", marginTop: 10 }}>
                        <span style={{ display: "block", fontSize: 11, fontWeight: 850, color: "#267a56", textTransform: "uppercase" as const, marginBottom: 5 }}>What changed since last rated?</span>
                        <textarea value={whatChanged[condition.id] || ""} onChange={(event) => setWhatChanged((previous) => ({ ...previous, [condition.id]: event.target.value }))} rows={2} placeholder={`Describe what is different today for ${condition.condition}...`} style={{ width: "100%", border: "1px solid #d9dfd5", borderRadius: 7, padding: 9, resize: "vertical" as const, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" as const }} />
                      </label>
                    </div>
                  ) : null}
                </div>
              );
            }) : <p style={{ margin: 0, color: "#667184", fontSize: 12 }}>Upload rated disabilities JSON to populate the Evidence Matrix.</p>}
          </div>
        ) : null}

        {decoderTab === "denials" ? (
          <div>
            <div style={{ background: "#f8e2df", border: "1px solid #f7c1c1", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
              <strong style={{ display: "block", color: "#a32d2d", fontSize: 13 }}>Prior denials are locked-door topics</strong>
              <p style={{ margin: "4px 0 0", color: "#793030", fontSize: 12, lineHeight: 1.5 }}>These rows came from prior VA decisions in the imported data. They are separated from opportunity rooms because prior denials usually require careful representative review, the original denial reason, and appropriate evidence before any next step.</p>
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Worth Representative Review ({representativeReviewDenials.length})</h3>
            {representativeReviewDenials.map((denial) => {
              const open = openDenialId === denial.id;
              return (
                <div key={denial.id} style={{ border: open ? "1px solid #b6504c" : "1px solid #d9dfd5", borderRadius: 8, marginBottom: 7, overflow: "hidden" }}>
                  <button type="button" onClick={() => setOpenDenialId(open ? null : denial.id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", border: 0, background: "#fff", padding: "10px 12px", cursor: "pointer", textAlign: "left" as const }}>
                    <span><strong style={{ display: "block", fontSize: 13 }}>{denial.condition}</strong><small style={{ color: "#667184" }}>{denial.category} - Code {denial.diagnosticCode}</small></span>
                    <Pill label="Prior denial" />
                  </button>
                  {open ? <p style={{ margin: 0, padding: "10px 12px", borderTop: "1px solid #edf0ea", background: "#f9fbf7", color: "#667184", fontSize: 12, lineHeight: 1.5 }}>{denial.notes}</p> : null}
                </div>
              );
            })}
            <h3 style={{ margin: "14px 0 8px", fontSize: 14 }}>Other Prior Denials ({otherDenials.length})</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 7 }} className="nonVaLaneGrid">
              {(otherDenials.length ? otherDenials : denials.length ? [] : [{ id: "empty", condition: "No prior denials decoded yet", diagnosticCode: "Upload data", category: "VA JSON", codeName: "", reviewLevel: "Prior denial" as const, notes: "" }]).map((denial) => (
                <div key={denial.id} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: "9px 11px", background: "#fff" }}>
                  <strong style={{ display: "block", fontSize: 12 }}>{denial.condition}</strong>
                  <span style={{ color: "#667184", fontSize: 11 }}>{denial.category} - {denial.diagnosticCode}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {decoderTab === "math" ? (
          <div>
            <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
              <strong style={{ color: "#8a6319", fontSize: 12 }}>Educational VA math only</strong>
              <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12 }}>VA uses whole-person math and may apply bilateral factors or other adjustments that this educational calculator may not reproduce exactly.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaStatsGrid">
              <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}><span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>Imported combined</span><div style={{ fontSize: 26, fontWeight: 950 }}>{displayedCombined !== null ? `${displayedCombined}%` : "N/A"}</div></div>
              <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}><span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>Calculator</span><div style={{ fontSize: 26, fontWeight: 950 }}>{combinedMath.rounded}%</div></div>
              <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}><span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>100% threshold</span><div style={{ fontSize: 26, fontWeight: 950 }}>95%+</div></div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>{combinedMath.sorted.map((rating, index) => <Pill key={`${rating}-${index}`} label={`${rating}%`} />)}</div>
            {combinedMath.steps.map((step, index) => <div key={`${step.rating}-${index}`} style={{ padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 6 }}><strong style={{ fontSize: 13 }}>Step {index + 1}: add {step.rating}%</strong><p style={{ margin: "2px 0 0", color: "#667184", fontSize: 12 }}>Raw combined value moves from {step.before}% to {step.after}%.</p></div>)}
            <div style={{ padding: "10px 12px", border: "1px solid #267a5644", borderRadius: 8, background: "#dff3e7", marginTop: 10 }}><strong style={{ color: "#267a56", fontSize: 14 }}>Rating Gap connection: {combinedMath.raw}% raw, rounds to {combinedMath.rounded}% combined. Educational examples should be checked against the Rating Gap Analyzer and an accredited representative.</strong></div>
          </div>
        ) : null}
      </Card>

      <Card title="Decoded Reference Tables" sub="Plain-English review of imported VA fields. Verify all fields against the original VA source." badge={`${conditions.length} conditions`}>
        <div style={{ overflowX: "auto", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 10 }}>
          <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" as const }}>
            <thead><tr style={{ background: "#f4f6f3" }}>{["Condition", "Rating", "Effective Date", "Static Indicator", "Diagnostic Code"].map((heading) => <th key={heading} style={{ padding: "9px 10px", textAlign: "left" as const, color: "#667184", fontSize: 11, textTransform: "uppercase" as const, borderBottom: "1px solid #d9dfd5" }}>{heading}</th>)}</tr></thead>
            <tbody>
              {conditions.length ? conditions.map((condition) => (
                <tr key={`${condition.condition}-${condition.rating}-${condition.effectiveDate}-${condition.diagnosticCode}`}>
                  <td style={{ padding: 10, borderBottom: "1px solid #edf0ea", fontSize: 12, fontWeight: 800 }}>{condition.condition}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #edf0ea", fontSize: 12 }}>{condition.rating !== null ? `${condition.rating}%` : "Not found"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #edf0ea", fontSize: 12 }}>{condition.effectiveDate}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #edf0ea", fontSize: 12 }}>{condition.staticIndicator}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #edf0ea", fontSize: 12 }}>{condition.diagnosticCode}</td>
                </tr>
              )) : <tr><td colSpan={5} style={{ padding: 10, color: "#667184", fontSize: 12 }}>No condition rows decoded yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ marginBottom: 10, padding: "9px 11px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0" }}>
          <strong style={{ color: "#8a6319", fontSize: 12 }}>Static indicator explanation</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12 }}>Static = condition currently appears marked as static within VA records. A static indicator does not automatically mean a rating is legally protected from future review or reduction. Discuss protection rules with an accredited representative.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }} className="nonVaLaneGrid">
          {[{ title: "Oldest effective dates", data: oldest }, { title: "Newest effective dates", data: newest }].map((group) => (
            <div key={group.title} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
              <strong style={{ fontSize: 13 }}>{group.title}</strong>
              {(group.data.length ? group.data : [{ condition: "No dated conditions found", effectiveDate: "Upload data" }]).map((condition) => <p key={`${condition.condition}-${condition.effectiveDate}`} style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>{condition.condition}: {condition.effectiveDate}</p>)}
            </div>
          ))}
        </div>
        {datedConditions.flatMap((condition) => dateMilestoneStatus(condition.effectiveDate).map((status) => ({ condition, status }))).map(({ condition, status }) => (
          <div key={`${condition.condition}-${status}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, border: "1px solid #d9dfd5", borderRadius: 8, padding: "9px 11px", marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>{condition.condition} has been service-connected since {condition.effectiveDate}.</span>
            <Pill label={status} />
          </div>
        ))}
        {diagnosticCodes.map((code) => (
          <div key={code} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 6 }}>
            <strong style={{ fontSize: 13 }}>{code}</strong><span style={{ color: "#667184", fontSize: 12 }}>{diagnosticDescription(code)}</span>
          </div>
        ))}
      </Card>

      <Card title="VSO Preparation Packet" sub="Use browser print/save as PDF for a portable discussion packet." badge="Exportable">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 10 }} className="nonVaLaneGrid">
          {packetSections.map((section) => <div key={section.title} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}><strong style={{ display: "block", fontSize: 13, marginBottom: 6 }}>{section.title}</strong>{(section.lines.length ? section.lines : ["Not enough decoded data yet"]).map((line) => <p key={line} style={{ margin: "4px 0 0", color: "#667184", fontSize: 12 }}>{line}</p>)}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="nonVaLaneGrid">
          <button type="button" onClick={exportVeteranSnapshot} disabled={!decoded} style={{ width: "100%", minHeight: 38, border: "1px solid #267a56", borderRadius: 8, background: decoded ? "#dff3e7" : "#f4f6f3", color: decoded ? "#267a56" : "#667184", fontWeight: 850, cursor: decoded ? "pointer" : "not-allowed" }}>Generate Veteran Snapshot</button>
          <button type="button" onClick={() => window.print()} style={{ width: "100%", minHeight: 38, border: "1px solid #d9dfd5", borderRadius: 8, background: "#fff", color: "#172132", fontWeight: 850, cursor: "pointer" }}>Print / save decoder packet as PDF</button>
        </div>
      </Card>
    </div>
  );
}

function evidenceStatus(need: string, documents: Doc[]) {
  const haystack = documents.map((doc) => `${doc.file_name} ${doc.category} ${doc.status}`.toLowerCase()).join(" ");
  const normalized = need.toLowerCase();

  const keywordGroups: Record<string, string[]> = {
    Diagnosis: ["diagnosis", "rating", "decision", "fmp", "benefit"],
    "Treatment records": ["treatment", "medical", "medication", "record", "vAMC".toLowerCase(), "surgery"],
    "Symptom log": ["statement", "personal", "symptom", "headache", "migraine"],
    "Medical opinion": ["nexus", "opinion", "dbq", "provider"],
    "ENT or neurology records": ["ent", "neuro", "neurology", "vertigo", "balance"],
    "Symptom documentation": ["statement", "symptom", "personal", "buddy"],
    "Medication or treatment notes": ["medication", "treatment", "vAMC".toLowerCase()],
    "Sleep notes": ["sleep", "cpap", "apnea"],
    "Functional impact statement": ["functional", "impact", "statement", "personal"],
    "Mental health notes": ["mental", "depression", "therapy", "psych"],
    "Medication history": ["medication", "list", "pharmacy"],
    "Work-impact statement": ["employment", "work", "ssdi", "statement"],
    "Therapy records": ["therapy", "mental", "counsel"],
    "Personal statement": ["personal", "statement"],
    "Buddy statement": ["buddy", "statement"],
    "Pain records": ["pain", "lumbar", "radiculopathy", "spine"],
    "Sleep documentation": ["sleep", "cpap", "apnea"],
    "Neurology exam": ["neuro", "neurology", "radiculopathy", "nerve"],
    Imaging: ["mri", "xray", "x-ray", "ct", "imaging"],
    "Pain treatment records": ["pain", "treatment", "medication"],
    "Functional loss statement": ["functional", "loss", "statement"],
    "Nerve study": ["emg", "nerve", "neurology"],
    "Specialist visit": ["specialist", "neuro", "orthopedic", "ent"],
    "Laterality documentation": ["left", "right", "bilateral", "radiculopathy"],
    "Symptom frequency": ["frequency", "flare", "symptom", "statement"],
    "Range of motion exam": ["range", "motion", "rom", "exam"],
    "Physical therapy records": ["physical therapy", "pt", "therapy"],
    "Assistive device notes": ["cane", "walker", "brace", "assistive"],
    "Flare-up statement": ["flare", "statement"],
    "Symptom description": ["symptom", "statement"],
    "Fall history": ["fall", "falls", "balance"],
    "Provider documentation": ["provider", "doctor", "treatment"],
    "Sleep treatment records": ["sleep", "cpap", "apnea"],
    "CPAP records": ["cpap", "sleep"],
    "Symptom statement": ["symptom", "statement"],
    "Sleep records": ["sleep", "cpap", "apnea"],
  };

  const keywords = keywordGroups[need] || normalized.split(" ");
  const matches = keywords.filter((keyword) => haystack.includes(keyword.toLowerCase())).length;
  if (matches >= 2) return "Found";
  if (matches === 1) return "Partial";
  return "Missing";
}

function readinessForPathway(needs: string[], documents: Doc[]) {
  const statuses = needs.map((need) => evidenceStatus(need, documents));
  const score = Math.round(statuses.reduce((sum, status) => {
    if (status === "Found") return sum + 25;
    if (status === "Partial") return sum + 12;
    return sum;
  }, 0));
  return { statuses, score: Math.min(100, score) };
}

function parseRating(value?: string | null) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function combineRatings(rawCombined: number, additional: number) {
  return Math.round(rawCombined + (100 - rawCombined) * (additional / 100));
}

function displayedVaRating(rawCombined: number) {
  if (rawCombined >= 95) return 100;
  return Math.round(rawCombined / 10) * 10;
}

export function RatingGapAnalyzer({ profile }: { profile: Profile }) {
  const displayedRating = parseRating(profile?.current_rating);
  if (!displayedRating) {
    return (
      <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
        <Card title="Rating Gap Analyzer" sub="Educational VA-math planning only. This does not predict outcomes or recommend filing." badge="Needs profile">
          <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0" }}>
            <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Add this veteran's rating first</strong>
            <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>
              Enter the veteran's current combined VA rating and upload the latest rating decision before using educational VA math examples.
            </p>
          </div>
        </Card>
      </div>
    );
  }
  const rawRange = displayedRating === 100
    ? "95-100"
    : `${Math.max(0, displayedRating - 5)}-${Math.min(94, displayedRating + 4)}`;
  const planningBaseline = displayedRating === 90 ? 90 : displayedRating;
  const scenarios = [
    { label: "One additional 50% condition", raw: combineRatings(planningBaseline, 50) },
    { label: "One additional 70% condition", raw: combineRatings(planningBaseline, 70) },
    { label: "Two additional 30% conditions", raw: combineRatings(combineRatings(planningBaseline, 30), 30) },
    { label: "Increase an existing 30% condition to 70%", raw: combineRatings(planningBaseline, 40) },
    { label: "Multiple smaller changes", raw: combineRatings(combineRatings(planningBaseline, 20), 20) },
  ];

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card title="Rating Gap Analyzer" sub="Educational VA-math planning only. This does not predict outcomes or recommend filing." badge="Educational calculator">
        <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
          <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>No outcome prediction</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>
            Educational use only. VA combined math examples require the exact individual ratings to be precise. Review all planning with an accredited VSO, attorney, or VA-accredited representative.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
            <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>Displayed rating</span>
            <div style={{ fontSize: 30, fontWeight: 950, lineHeight: 1.1 }}>{displayedRating}%</div>
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
            <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>Possible raw range</span>
            <div style={{ fontSize: 30, fontWeight: 950, lineHeight: 1.1 }}>{rawRange}%</div>
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
            <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>100% threshold</span>
            <div style={{ fontSize: 30, fontWeight: 950, lineHeight: 1.1 }}>95%+</div>
          </div>
        </div>

        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Educational Examples</h3>
        {scenarios.map((scenario) => (
          <div key={scenario.label} style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 7 }}>
            <div>
              <strong style={{ fontSize: 13 }}>{scenario.label}</strong>
              <p style={{ margin: "2px 0 0", color: "#667184", fontSize: 11 }}>Uses a planning baseline of {planningBaseline}% until individual ratings are entered.</p>
            </div>
            <div style={{ textAlign: "right" as const }}>
              <strong style={{ color: readinessTone(scenario.raw), fontSize: 18 }}>{scenario.raw}% raw</strong>
              <div style={{ color: "#667184", fontSize: 11 }}>rounds to {displayedVaRating(scenario.raw)}%</div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 10, padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 8 }}>
          <strong style={{ display: "block", fontSize: 13 }}>What would make this exact?</strong>
          <p style={{ margin: "3px 0 0", color: "#667184", fontSize: 12 }}>
            Add the veteran's individual rating breakdown and bilateral-factor details from the latest rating decision. Until then, this is a planning aid, not a definitive VA math calculation.
          </p>
        </div>
      </Card>
    </div>
  );
}

export function TDIUReadinessExplorer({ profile, documents = [] }: { profile: Profile; documents?: Doc[] }) {
  const rating = ratingDisplay(profile?.current_rating);
  const workStatus = profile?.work_status || "Not entered";
  const ssdiLikely = /ssdi|ssa|social security/i.test(workStatus) || documents.some((doc) => /ssdi|ssa|bpqy|social security/i.test(`${doc.category} ${doc.file_name}`));
  const unemployedLikely = /unemployed|unable|not working|retired|ssdi/i.test(workStatus);
  const statusSignals = [
    { label: "Combined rating", value: rating, tone: rating === "Add rating" ? "Missing" : "Found" },
    { label: "Work status", value: workStatus, tone: workStatus === "Not entered" ? "Missing" : unemployedLikely ? "Found" : "Partial" },
    { label: "SSDI context", value: ssdiLikely ? "Present" : "Not found", tone: ssdiLikely ? "Found" : "Missing" },
  ];
  const evidenceRows = tdiuEvidenceAreas.map((item) => {
    const found = documents.some((doc) => item.keywords.test(`${doc.category} ${doc.file_name}`));
    return { ...item, status: found ? "Found" : "Missing" };
  });
  const foundCount = evidenceRows.filter((row) => row.status === "Found").length;
  const readinessLabel = foundCount >= 4 ? "Strong prep file" : foundCount >= 2 ? "Partial prep file" : "Needs evidence";
  const representativeQuestions = [
    "Do my service-connected conditions meet a threshold that should be reviewed for TDIU conversation purposes?",
    "Which conditions appear to drive work limitations, and are those conditions service connected?",
    "What employment history, earnings records, or employer forms would you want before advising me?",
    "How should SSDI evidence be separated from VA evidence so the record stays accurate?",
    "Would a vocational assessment, provider statement, or functional impact statement help clarify the record?",
  ];

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card title="TDIU Readiness Explorer" sub="Educational preparation for Total Disability Based on Individual Unemployability conversations." badge="VSO review">
        <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
          <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Preparation only</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>
            Educational use only. This does not determine TDIU eligibility, predict approval, recommend filing, or replace an accredited VSO, attorney, or VA-accredited representative.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          {statusSignals.map((signal) => (
            <div key={signal.label} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
              <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>{signal.label}</span>
              <div style={{ fontSize: 18, fontWeight: 950, lineHeight: 1.2, marginTop: 4 }}>{signal.value}</div>
              <div style={{ marginTop: 6 }}><Pill label={signal.tone} /></div>
            </div>
          ))}
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
            <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>TDIU prep readiness</span>
            <div style={{ fontSize: 18, fontWeight: 950, lineHeight: 1.2, marginTop: 4 }}>{readinessLabel}</div>
            <div style={{ marginTop: 6 }}><Pill label={readinessLabel === "Needs evidence" ? "Missing" : readinessLabel === "Partial prep file" ? "Partial" : "Found"} /></div>
          </div>
        </div>

        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Evidence Readiness</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          {evidenceRows.map((row) => (
            <div key={row.area} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <strong style={{ fontSize: 13 }}>{row.area}</strong>
                <Pill label={row.status} />
              </div>
              <p style={{ margin: "6px 0 0", color: "#172132", fontSize: 12, fontWeight: 700 }}>{row.need}</p>
              <p style={{ margin: "3px 0 0", color: "#667184", fontSize: 11, lineHeight: 1.4 }}>{row.why}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="nonVaLaneGrid">
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>Questions for Your Representative</strong>
            {representativeQuestions.map((question) => (
              <p key={question} style={{ margin: "6px 0 0", color: "#667184", fontSize: 12 }}>{question}</p>
            ))}
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>What this module should not do</strong>
            {[
              "It should not say you are eligible or ineligible.",
              "It should not choose TDIU over schedular 100% planning.",
              "It should not merge SSA rules with VA rules.",
              "It should not recommend filing without accredited review.",
            ].map((item) => (
              <p key={item} style={{ margin: "6px 0 0", color: "#667184", fontSize: 12 }}>{item}</p>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function VSOPacketGenerator({ profile, documents = [] }: { profile: Profile; documents?: Doc[] }) {
  const topTopics = secondaryConditions.flatMap((condition) =>
    condition.pathways.map((pathway) => {
      const readiness = readinessForPathway(pathway.needs, documents);
      return { condition: condition.condition, topic: pathway.topic, score: readiness.score };
    })
  ).sort((a, b) => b.score - a.score).slice(0, 6);
  const evidenceCategories = Array.from(new Set(documents.map((doc) => documentLabel(doc.category)))).slice(0, 8);
  const missingEvidence = ["Latest rating decision with individual ratings", "Nexus or medical opinion where applicable", "Personal functional impact statement", "Condition logs such as headache or flare-up logs", "Updated specialist records"].slice(0, 5);
  const rating = ratingDisplay(profile?.current_rating);

  function printPacket() {
    window.print();
  }

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card title="VSO Meeting Packet Generator" sub="One-page preparation packet for VSO, attorney, or VA-accredited representative conversations." badge="Print-ready">
        <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
          <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Preparation only</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>{educationDisclaimer}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>Current profile snapshot</strong>
            {[
              `Displayed rating: ${rating}`,
              `Branch: ${profile?.branch || "Not entered"}`,
              `State: ${stateDisplay(profile?.state)}`,
              `P&T status: ${profile?.permanent_total_status || "Not entered"}`,
              `Work status: ${profile?.work_status || "Not entered"}`,
            ].map((item) => <p key={item} style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>{item}</p>)}
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>Questions for representative</strong>
            {[
              "Which discussion topics are evidence-ready enough to review?",
              "What documentation appears missing before any claim decision?",
              "Are any symptoms already compensated under another condition?",
              "What records should be gathered before the next appointment?",
            ].map((item) => <p key={item} style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>{item}</p>)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>Potential discussion topics</strong>
            {topTopics.map((topic) => <p key={`${topic.condition}-${topic.topic}`} style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>{topic.topic} <span style={{ color: "#267a56" }}>({topic.score})</span></p>)}
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>Evidence available</strong>
            {(evidenceCategories.length ? evidenceCategories : ["No uploaded evidence categories yet"]).map((item) => <p key={item} style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>{item}</p>)}
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>Evidence to discuss</strong>
            {missingEvidence.map((item) => <p key={item} style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>{item}</p>)}
          </div>
        </div>

        <button onClick={printPacket} type="button" style={{ width: "100%", minHeight: 40, borderRadius: 8, border: "1px solid #d9dfd5", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "#172132" }}>
          Generate VSO packet / save as PDF
        </button>
      </Card>
    </div>
  );
}

export function SSDIEvidenceMapper({ documents = [] }: { documents?: Doc[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const ssdiDocs = documents.filter((doc) => doc.category === "ssdi-records" || /ssdi|ssa|bpqy|social security/i.test(doc.file_name));
  const employmentDocs = documents.filter((doc) => doc.category === "employment" || /employment|work|job|wage/i.test(doc.file_name));
  const matched = graphConditions.filter((condition) => selected.includes(condition.name));
  const unmatched = graphConditions.filter((condition) => !selected.includes(condition.name));
  const overlapLabel = matched.length >= 3 ? "Strong SSDI-to-SC overlap" : matched.length ? "Partial overlap" : "No SSDI conditions selected";

  const checklist = [
    { label: "SSDI award letter or BPQY", status: ssdiDocs.length ? "Found" : "Missing", note: "Confirms SSA award context, onset, and recognized conditions where available." },
    { label: "Work history", status: employmentDocs.length ? "Found" : "Missing", note: "SSA and VSO conversations both benefit from job duties, hours, dates, and limits." },
    { label: "Medical basis mapped to VA SC list", status: matched.length ? "Partial" : "Missing", note: "Map SSA-recognized conditions to VA service-connected conditions without merging the legal standards." },
    { label: "Functional impact statement", status: documents.some((doc) => /statement|impact|personal/i.test(doc.file_name)) ? "Found" : "Missing", note: "Explains daily limits, work limits, fatigue, pain, sleep, concentration, and reliability." },
  ];

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card title="SSDI / SSA Evidence Mapper" sub="Map SSA disability evidence to VA service-connected evidence context without treating the systems as the same." badge="VA ≠ SSA">
        <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
          <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Separate systems</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>
            SSDI and VA compensation use different rules. This tool organizes overlapping evidence for education and VSO preparation only.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
            <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>SSA documents</span>
            <div style={{ fontSize: 30, fontWeight: 950, lineHeight: 1.1 }}>{ssdiDocs.length}</div>
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
            <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>Matched conditions</span>
            <div style={{ fontSize: 30, fontWeight: 950, lineHeight: 1.1 }}>{matched.length}</div>
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
            <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>Readiness</span>
            <div style={{ fontSize: 20, fontWeight: 950, lineHeight: 1.25 }}>{overlapLabel}</div>
          </div>
        </div>

        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Select Conditions SSA Recognized or Discussed</h3>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 12 }}>
          {graphConditions.map((condition) => (
            <button key={condition.id} onClick={() => setSelected((prev) => prev.includes(condition.name) ? prev.filter((name) => name !== condition.name) : [...prev, condition.name])} style={{ padding: "6px 10px", borderRadius: 6, border: `1.5px solid ${selected.includes(condition.name) ? "#267a56" : "#d9dfd5"}`, background: selected.includes(condition.name) ? "#dff3e7" : "#fff", color: selected.includes(condition.name) ? "#267a56" : "#667184", fontWeight: selected.includes(condition.name) ? 800 : 500, fontSize: 12, cursor: "pointer" }}>
              {condition.name}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>Matched VA / SSA conditions</strong>
            {matched.map((condition) => <p key={condition.id} style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>{condition.name} <span style={{ color: "#267a56" }}>VA-adjudicated + SSA-recognized</span></p>)}
            {!matched.length && <p style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>None selected yet.</p>}
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ fontSize: 13 }}>Not matched yet</strong>
            {unmatched.map((condition) => <p key={condition.id} style={{ margin: "5px 0 0", color: "#667184", fontSize: 12 }}>{condition.name} <span>research evidence lane</span></p>)}
          </div>
        </div>

        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>Evidence Readiness</h3>
        {checklist.map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 7 }}>
            <div>
              <strong style={{ fontSize: 13 }}>{item.label}</strong>
              <p style={{ margin: "2px 0 0", color: "#667184", fontSize: 11 }}>{item.note}</p>
            </div>
            <Pill label={item.status} />
          </div>
        ))}
      </Card>

      <Card title="SSDI Application / Records Assistance" sub="Preparation steps for applying, retrieving records, or using an existing award for evidence context." badge="Educational">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }} className="nonVaLaneGrid">
          {ssdiApplicationPhases.map((phase) => (
            <div key={phase.phase} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
              <strong style={{ display: "block", fontSize: 14, marginBottom: 8 }}>{phase.phase}</strong>
              {phase.steps.map((step) => (
                <div key={step.title} style={{ padding: "8px 0", borderTop: "1px solid #edf0ea" }}>
                  <Pill label={step.status} />
                  <strong style={{ display: "block", marginTop: 5, fontSize: 12 }}>{step.title}</strong>
                  <p style={{ margin: "2px 0 0", color: "#667184", fontSize: 11, lineHeight: 1.4 }}>{step.detail}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function SecondaryOpportunityExplorer({ documents = [] }: { documents?: Doc[] }) {
  const discussionTopics = secondaryConditions.flatMap((condition) =>
    condition.pathways.map((pathway) => {
      const readiness = readinessForPathway(pathway.needs, documents);
      return {
        condition: condition.condition,
        rating: condition.rating,
        topic: pathway.topic,
        score: readiness.score,
        questions: pathway.questions,
        needs: pathway.needs,
        statuses: readiness.statuses,
      };
    })
  ).sort((a, b) => b.score - a.score);

  const topTopics = discussionTopics.slice(0, 4);
  const availableDocs = documents.slice(0, 6).map((doc) => documentLabel(doc.category));
  const missingDocs = Array.from(new Set(discussionTopics.flatMap((topic) => topic.needs.filter((need, index) => topic.statuses[index] === "Missing")))).slice(0, 7);

  function printBrief() {
    window.print();
  }

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card title="Secondary Condition Opportunity Explorer" sub="Educational preparation for VSO, attorney, or VA-accredited representative conversations." badge="No claim prediction">
        <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
          <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Educational use only</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>{educationDisclaimer}</p>
          <p style={{ margin: "4px 0 0", color: "#8a6319", fontSize: 11 }}>Readiness scores mean “amount of supporting documentation found,” not chance of approval.</p>
        </div>

        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Potential Discussion Topics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          {topTopics.map((topic, index) => (
            <div key={`${topic.condition}-${topic.topic}`} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
              <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>Topic {index + 1}</span>
              <strong style={{ display: "block", fontSize: 14, marginTop: 3 }}>{topic.topic}</strong>
              <p style={{ margin: "2px 0 8px", color: "#667184", fontSize: 12 }}>{topic.condition} · Current rating: {topic.rating}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#667184", fontSize: 11 }}>Evidence readiness</span>
                <strong style={{ color: readinessTone(topic.score), fontSize: 20 }}>{topic.score}</strong>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#f4f6f3", overflow: "hidden", marginTop: 5 }}>
                <div style={{ width: `${topic.score}%`, height: "100%", background: readinessTone(topic.score) }} />
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>Service-Connected Condition Analyzer</h3>
        {secondaryConditions.map((condition) => (
          <div key={condition.condition} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <strong style={{ display: "block", fontSize: 15 }}>{condition.condition}</strong>
                <span style={{ color: "#667184", fontSize: 12 }}>Current rating: {condition.rating}</span>
              </div>
              <Pill label="Review areas" />
            </div>
            {condition.pathways.map((pathway) => {
              const readiness = readinessForPathway(pathway.needs, documents);
              return (
                <div key={pathway.topic} style={{ padding: "10px 0", borderTop: "1px solid #edf0ea" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <strong style={{ fontSize: 13 }}>{pathway.topic}</strong>
                    <span style={{ color: readinessTone(readiness.score), fontSize: 13, fontWeight: 900 }}>{readiness.score}/100</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6, marginTop: 7 }} className="nonVaStatsGrid">
                    {pathway.needs.map((need, index) => (
                      <div key={need} style={{ border: "1px solid #edf0ea", borderRadius: 7, padding: 8, background: "#f9fbf7" }}>
                        <span style={{ display: "block", fontSize: 11, color: "#172132", fontWeight: 750 }}>{need}</span>
                        <Pill label={readiness.statuses[index]} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 7 }}>
                    <span style={{ color: "#267a56", fontSize: 10, fontWeight: 850, textTransform: "uppercase" as const }}>Questions for your VSO</span>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {pathway.questions.map((question) => (
                        <li key={question} style={{ color: "#667184", fontSize: 12, marginBottom: 3 }}>{question}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </Card>

      <Card title="VSO Preparation Brief" sub="Portable discussion packet. This is not legal, medical, or claims advice." badge="Export-ready">
        <p style={{ margin: "0 0 10px", color: "#8a6319", fontSize: 12 }}>{educationDisclaimer}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaLaneGrid">
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 10 }}>
            <strong style={{ fontSize: 13 }}>Topics to discuss</strong>
            {topTopics.map((topic) => <p key={topic.topic} style={{ margin: "5px 0 0", fontSize: 12, color: "#667184" }}>{topic.topic}</p>)}
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 10 }}>
            <strong style={{ fontSize: 13 }}>Documents available</strong>
            {(availableDocs.length ? availableDocs : ["No uploaded evidence detected yet"]).map((doc) => <p key={doc} style={{ margin: "5px 0 0", fontSize: 12, color: "#667184" }}>{doc}</p>)}
          </div>
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 10 }}>
            <strong style={{ fontSize: 13 }}>Documents missing</strong>
            {missingDocs.map((doc) => <p key={doc} style={{ margin: "5px 0 0", fontSize: 12, color: "#667184" }}>{doc}</p>)}
          </div>
        </div>
        <button onClick={printBrief} type="button" style={{ width: "100%", minHeight: 40, borderRadius: 8, border: "1px solid #d9dfd5", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "#172132" }}>
          Print / save as PDF
        </button>
      </Card>
    </div>
  );
}

export function VeteranDashboard({ profile, userEmail, documents = [] }: { profile: Profile; userEmail: string; documents?: Doc[] }) {
  const [selectedCat, setSelectedCat] = useState("Schedular Review");
  const [understanding, setUnderstanding] = useState([false, false, false, false, false, false]);
  const [protocol, setProtocol] = useState([false, false, false, false]);
  const [briefCopied, setBriefCopied] = useState(false);

  const branch = profile?.branch || "Add branch";
  const state = stateDisplay(profile?.state);
  const rating = ratingDisplay(profile?.current_rating);
  const cat = categories.find((c) => c.name === selectedCat) || categories[0];
  const vaultGroups = dedupeDocuments(documents);
  const hasPersonalContext = Boolean(
    profile?.branch ||
    profile?.state ||
    profile?.current_rating ||
    profile?.work_status ||
    profile?.service_status ||
    documents.length
  );

  // Build live evidence inventory from real uploaded documents
  const uploadedCategories = new Set(documents.map((d) => d.category));
  const liveEvidenceInventory = evidenceConfig.map((item) => ({
    ...item,
    status: uploadedCategories.has(item.docCategory) ? "Complete" : "Missing",
  }));

  const completedCount = liveEvidenceInventory.filter((i) => i.status === "Complete").length;
  const totalCount = liveEvidenceInventory.length;
  const evidenceReadinessScore = Math.round((completedCount / totalCount) * 100);

  if (!hasPersonalContext) {
    return (
      <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
        <Card title="Start This Veteran's Workspace" sub="This account has no veteran-specific profile or uploaded evidence yet." badge="Blank profile">
          <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
            <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Private workspace is empty</strong>
            <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>
              Complete the Veteran Profile and upload this veteran's own documents before the navigator builds a journey, evidence map, or VSO packet.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }} className="nonVaLaneGrid">
            {[
              "Enter branch, state, rating, work status, and dependents.",
              "Upload VA letters, rating decisions, service records, medical records, or SSDI records.",
              "Use the Possibility Library to learn what questions may apply.",
              "Generate VSO-ready questions only after this veteran's evidence is present.",
            ].map((item) => (
              <div key={item} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
                <p style={{ margin: 0, color: "#667184", fontSize: 12, lineHeight: 1.45 }}>{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Evidence Inventory" sub="Everything starts missing until this veteran uploads or enters their own records." badge={`0/${totalCount} complete`}>
          {liveEvidenceInventory.map((item) => (
            <div key={item.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
              <div>
                <strong style={{ fontSize: 13 }}>{item.category}</strong>
                <p style={{ margin: "1px 0 0", fontSize: 11, color: "#667184" }}>{item.note}</p>
              </div>
              <Pill label="Missing" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

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
          {[{ label: "Known now", value: String(completedCount), title: "Evidence categories present", text: "Verified facts appear here only after this veteran uploads or saves their own records." },
            { label: "Translated", value: String(documents.length), title: "Documents available", text: "The app explains uploaded documents and why they matter to benefits, claims research, or next actions." },
            { label: "Unblocked", value: String(Math.max(0, completedCount - 1)), title: "Benefit lanes started", text: "Federal, state, health, housing, work, and family lanes unlock as evidence is added." },
            { label: "Still open", value: String(totalCount - completedCount), title: "Evidence gaps named", text: "Missing categories remain visible so the veteran knows what to gather next." }].map((item) => (
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
        {vaultGroups.length > 0 ? (
          vaultGroups.map(({ primary: doc, duplicates, count }) => (
            <div key={doc.id} style={{ padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: 13, overflowWrap: "anywhere" as const }}>{doc.file_name}</strong>
                  <small style={{ color: "#667184", fontSize: 11 }}>Category: {documentLabel(doc.category)}</small>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" as const, justifyContent: "flex-end" }}>
                  {count > 1 ? <Pill label={`${count} copies`} /> : <Pill label="Uploaded" />}
                  <form action={deleteDocument}>
                    <input type="hidden" name="document_id" value={doc.id} />
                    <button type="submit" style={{ minHeight: 24, border: "1px solid #d9dfd5", borderRadius: 6, background: "#fff", color: "#b6504c", fontSize: 11, fontWeight: 700, padding: "0 8px" }}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              {duplicates.length > 0 ? (
                <form action={deleteDuplicateDocuments} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 7, paddingTop: 7, borderTop: "1px solid #edf0ea" }}>
                  <small style={{ color: "#667184", fontSize: 11 }}>Showing newest upload. {duplicates.length} older duplicate {duplicates.length === 1 ? "copy is" : "copies are"} hidden.</small>
                  {duplicates.map((duplicate) => (
                    <input key={duplicate.id} type="hidden" name="duplicate_document_id" value={duplicate.id} />
                  ))}
                  <button type="submit" style={{ minHeight: 26, border: "1px solid #b98922", borderRadius: 6, background: "#fbefd0", color: "#8a6319", fontSize: 11, fontWeight: 800, padding: "0 9px", whiteSpace: "nowrap" as const }}>
                    Remove duplicates
                  </button>
                </form>
              ) : null}
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
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#667184" }}>
          VSO-ready chronology: what happened, what proves it, and why it matters. This organizes the story without claiming entitlement.
        </p>
        <div style={{ overflowX: "auto", border: "1px solid #d9dfd5", borderRadius: 8 }}>
          <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" as const, background: "#fff" }}>
            <thead>
              <tr style={{ background: "#f4f6f3" }}>
                {["Date", "Event", "Evidence", "Impact", "Status"].map((heading) => (
                  <th key={heading} style={{ padding: "9px 10px", textAlign: "left" as const, color: "#667184", fontSize: 11, textTransform: "uppercase" as const, borderBottom: "1px solid #d9dfd5" }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lifeEvents.map((event) => (
                <tr key={`${event.when}-${event.event}`}>
                  <td style={{ padding: "10px", verticalAlign: "top", borderBottom: "1px solid #edf0ea", color: "#b98922", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" as const }}>{event.when}</td>
                  <td style={{ padding: "10px", verticalAlign: "top", borderBottom: "1px solid #edf0ea" }}>
                    <strong style={{ display: "block", fontSize: 13 }}>{event.event}</strong>
                    <small style={{ display: "block", marginTop: 2, color: "#667184", fontSize: 11, lineHeight: 1.35 }}>{event.detail}</small>
                  </td>
                  <td style={{ padding: "10px", verticalAlign: "top", borderBottom: "1px solid #edf0ea", color: "#172132", fontSize: 12 }}>{event.evidence}</td>
                  <td style={{ padding: "10px", verticalAlign: "top", borderBottom: "1px solid #edf0ea", color: "#172132", fontSize: 12 }}>{event.impact}</td>
                  <td style={{ padding: "10px", verticalAlign: "top", borderBottom: "1px solid #edf0ea" }}><Pill label={event.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, padding: "9px 11px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0" }}>
          <strong style={{ color: "#8a6319", fontSize: 12 }}>Next timeline upgrade</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12 }}>
            Let the veteran add events, attach evidence, and export this as a one-page VSO conversation packet.
          </p>
        </div>
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
        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>Evidence Matrix v2</h3>
        <div style={{ padding: "10px 12px", border: "1px solid #267a5644", borderRadius: 7, background: "#dff3e7", marginBottom: 8 }}>
          <strong style={{ display: "block", color: "#267a56", fontSize: 13 }}>Use VA Data Decoder for the live matrix</strong>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#267a56" }}>The old placeholder rows have been replaced by an import-driven Evidence Matrix, Prior Denials list, and VA Math tab. Upload this veteran's VA JSON in the VA Data Decoder section to populate real rows for that signed-in user only.</p>
        </div>
        <h3 style={{ margin: "12px 0 8px", fontSize: 14 }}>SSDI Mapping</h3>
        {["What conditions are listed on the SSDI award or BPQY?", "Which SSDI conditions match the veteran's service-connected condition list?", "Which conditions affect work but are not yet VA service-connected?", "Which evidence supports schedular increase versus TDIU discussion?"].map((item, i) => (
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
      <Card title="Readiness Score" sub="Based only on this account's uploaded evidence inventory. More records improve the preparation picture.">
        <div style={{ textAlign: "center" as const, marginBottom: 14, minWidth: 120 }}>
          <div style={{ display: "inline-flex", flexDirection: "column" as const, alignItems: "center", whiteSpace: "nowrap" as const }}>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 0.95, whiteSpace: "nowrap" as const }}>{evidenceReadinessScore}</div>
            <div style={{ fontSize: 12, color: "#667184", whiteSpace: "nowrap" as const }}>ready</div>
          </div>
        </div>
        {[{ label: "Uploaded evidence categories", value: completedCount }, { label: "Missing evidence categories", value: totalCount - completedCount }, { label: "Documents uploaded", value: documents.length }].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 11px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 5 }}>
            <span style={{ fontSize: 13 }}>{item.label}</span><strong>{item.value}</strong>
          </div>
        ))}
        <div style={{ marginTop: 10, padding: "11px 13px", border: "1px solid #b98922", borderRadius: 8, background: "#fbefd0" }}>
          <strong style={{ fontSize: 12, color: "#b98922" }}>Evidence map</strong>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#b98922" }}>Upload rating decisions, medical records, SSDI records, and employment history to improve this preparation score.</p>
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

export function NonVaBenefits({ profile }: { profile: Profile }) {
  const state = stateDisplay(profile?.state);
  const branch = profile?.branch || "Add branch";
  const rating = ratingDisplay(profile?.current_rating);
  const benefitSource = branchBenefitSource(branch);
  const selectedStateLanes = nationwideStateBenefitLanes(state, branch);
  const readyCount = selectedStateLanes.filter((lane) => ["Ready", "Strong", "High", "Likely", "Start Here", "Federal", "Branch"].includes(lane.level)).length;
  const hasState = Boolean(profile?.state);

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card
        title="Non-VA Benefits Navigator"
        sub={`State, federal, county, retail, housing, and career opportunities for a ${branch} veteran in ${state} with ${rating} service connection.`}
        badge={`${readyCount} priority lanes`}
      >
        {!hasState ? (
          <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
            <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Select this veteran's state first</strong>
            <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>
              State, DMV, property tax, parks, and local benefits vary by residence. Save a state in Veteran Profile to personalize this section.
            </p>
          </div>
        ) : null}
        <div className="nonVaStatsGrid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 14 }}>
          {[
            { label: "State", value: state, text: state === "Florida" ? "parks, tax, county steps" : "state benefits guide" },
            { label: "Branch", value: branch, text: benefitSource.label },
            { label: "Lifestyle", value: "MWR", text: "commissary / exchange review" },
            { label: "Family", value: "Spouse+", text: "dependent / survivor checks" },
          ].map((item) => (
            <div key={item.label} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12, background: "#f9fbf7" }}>
              <span style={{ fontSize: 10, color: "#267a56", fontWeight: 800, textTransform: "uppercase" as const }}>{item.label}</span>
              <div style={{ fontSize: 24, fontWeight: 950, lineHeight: 1.1, marginTop: 3 }}>{item.value}</div>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "#667184" }}>{item.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 10, background: "#fff" }}>
          <div>
            <strong style={{ fontSize: 13 }}>{state} selected</strong>
            <p style={{ margin: "2px 0 0", color: "#667184", fontSize: 12 }}>
              Change the state or branch in Veteran Profile, save, and this section updates for that state, territory, and component.
            </p>
          </div>
          {hasState ? (
            <a href={stateBenefitsUrl(state, branch)} target="_blank" rel="noreferrer" style={{ color: "#315f9e", fontSize: 12, fontWeight: 850, whiteSpace: "nowrap", textDecoration: "none" }}>
              Open state guide
            </a>
          ) : (
            <span style={{ color: "#667184", fontSize: 12, fontWeight: 850, whiteSpace: "nowrap" }}>State needed</span>
          )}
        </div>

        <div className="nonVaLaneGrid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          {selectedStateLanes.map((lane) => (
            <div key={lane.area} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                <strong style={{ fontSize: 14 }}>{lane.area}</strong>
                <Pill label={lane.level} />
              </div>
              <p style={{ margin: "0 0 7px", fontSize: 12, color: "#667184", lineHeight: 1.45 }}>{lane.why}</p>
              <div style={{ padding: "8px 9px", borderRadius: 7, background: "#f4f6f3", border: "1px solid #edf0ea" }}>
                <span style={{ display: "block", color: "#267a56", fontSize: 10, fontWeight: 850, textTransform: "uppercase" as const }}>Next check</span>
                <p style={{ margin: "2px 0 0", color: "#172132", fontSize: 12, lineHeight: 1.4 }}>{lane.next}</p>
              </div>
              {lane.sourceUrl ? (
                <a href={lane.sourceUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 7, color: "#315f9e", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
                  Source: {lane.source}
                </a>
              ) : (
                <small style={{ display: "block", marginTop: 7, color: "#667184", fontSize: 11 }}>Source: {lane.source}</small>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, border: "1px solid #b9892244", background: "#fbefd0" }}>
          <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Research assistant posture</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>
            These are investigation lanes, not final eligibility decisions. Requirements can vary by county, agency, card status, and documentation.
          </p>
        </div>
      </Card>

      <Card title="Seasonal Perks Tracker" sub="Holiday, travel, DMV, parks, attraction, restaurant, and local appreciation offers need date-aware checking." badge="Time-sensitive">
        {seasonalPerks.map((perk) => (
          <div key={perk.title} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 7 }}>
            <span style={{ minWidth: 92, color: "#b98922", fontSize: 11, fontWeight: 850 }}>{perk.window}</span>
            <div>
              <strong style={{ fontSize: 13 }}>{perk.title}</strong>
              <p style={{ margin: "2px 0 0", color: "#667184", fontSize: 12, lineHeight: 1.45 }}>{perk.detail}</p>
            </div>
          </div>
        ))}
        <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d9dfd5", background: "#f9fbf7" }}>
          <strong style={{ display: "block", fontSize: 13 }}>What the app should eventually automate</strong>
          <p style={{ margin: "3px 0 0", color: "#667184", fontSize: 12, lineHeight: 1.45 }}>
            A yearly reminder engine that checks official agency pages and verified merchant pages before Memorial Day, Military Appreciation Month, Veterans Day, birthdays, travel dates, vehicle purchases, and home purchases.
          </p>
        </div>
      </Card>

      <Card title="Value Readiness Legend" sub="A shared vocabulary for every state, branch, family role, and benefit type.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }} className="nonVaStatsGrid">
          {[
            { label: "Ready", text: "Likely actionable with current proof." },
            { label: "Check", text: "Needs agency/county confirmation." },
            { label: "Investigate", text: "Potentially valuable but evidence or rules are unclear." },
            { label: "Seasonal", text: "Date-window offer; verify before travel/holiday." },
            { label: "Local", text: "County, city, nonprofit, or office-specific." },
            { label: "Federal", text: "Nationwide baseline, not state-specific." },
            { label: "Branch", text: "Branch/component/family-role source lane." },
            { label: "Start Here", text: "Best first official guide for this state." },
          ].map((item) => (
            <div key={item.label} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 10 }}>
              <Pill label={item.label} />
              <p style={{ margin: "7px 0 0", color: "#667184", fontSize: 12, lineHeight: 1.4 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function BenefitsPossibilityLibrary({ profile, documents = [] }: { profile: Profile; documents?: Doc[] }) {
  const [activeCategory, setActiveCategory] = useState(possibilityLibrary[0].category);
  const active = possibilityLibrary.find((item) => item.category === activeCategory) || possibilityLibrary[0];
  const state = stateDisplay(profile?.state);
  const branch = profile?.branch || "Not entered";
  const rating = ratingDisplay(profile?.current_rating);
  const workStatus = profile?.work_status || "Not entered";
  const dependents = profile?.dependent_status || "Not entered";
  const documentNames = documents.map((doc) => `${doc.category} ${doc.file_name}`.toLowerCase()).join(" ");

  function evidenceStatusFor(label: string) {
    const normalized = label.toLowerCase();
    const hints: Record<string, RegExp> = {
      rating: /rating|decision|benefit summary|benefit_summary/,
      medical: /medical|treatment|medication|exam|therapy|mri|imaging|sleep|mental|neurology/,
      symptom: /symptom|log|statement|impact|flare/,
      functional: /functional|impact|statement|work|employment/,
      work: /work|employment|job|wage|earnings|ssdi|ssa/,
      ssdi: /ssdi|ssa|bpqy|social security/,
      coe: /coe|certificate|eligibility|loan|mortgage/,
      county: /county|property|tax|homestead/,
      fmp: /foreign medical|fmp/,
      service: /dd214|dd-214|service|proof/,
      civil: /civil|preference|federal/,
      dependent: /dependent|spouse|marriage|child/,
    };
    const key = Object.keys(hints).find((hint) => normalized.includes(hint));
    if (!key) return "Check";
    return hints[key].test(documentNames) ? "Found" : "Missing";
  }

  const profileSignals = [
    { label: "Branch", value: branch },
    { label: "State", value: state },
    { label: "Rating", value: rating },
    { label: "Work", value: workStatus },
    { label: "Dependents", value: dependents || "None" },
  ];

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card title="Benefits Possibility Library" sub="A plain-language map of VA, state, federal, family, work, housing, and quality-of-life benefits veterans may not know to ask about." badge="Education map">
        <div style={{ padding: "10px 12px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0", marginBottom: 12 }}>
          <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>No entitlement decision</strong>
          <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 12, lineHeight: 1.45 }}>
            This library teaches possibilities and questions to ask. It does not determine eligibility, recommend claims, or replace an accredited VSO, attorney, benefits counselor, agency, or qualified representative.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaStatsGrid">
          {profileSignals.map((signal) => (
            <div key={signal.label} style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 10, background: "#f9fbf7" }}>
              <span style={{ fontSize: 10, color: "#267a56", fontWeight: 850, textTransform: "uppercase" as const }}>{signal.label}</span>
              <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.25, marginTop: 3 }}>{signal.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }} className="nonVaStatsGrid">
          {possibilityLibrary.map((item) => (
            <button key={item.category} type="button" onClick={() => setActiveCategory(item.category)} style={{ minHeight: 72, borderRadius: 8, border: `1.5px solid ${active.category === item.category ? "#267a56" : "#d9dfd5"}`, background: active.category === item.category ? "#dff3e7" : "#fff", cursor: "pointer", textAlign: "left" as const, padding: "10px 11px" }}>
              <span style={{ display: "block", color: "#267a56", fontSize: 11, fontWeight: 900 }}>{item.initials}</span>
              <strong style={{ display: "block", fontSize: 13, color: "#172132", marginTop: 3 }}>{item.category}</strong>
              <span style={{ display: "block", color: "#667184", fontSize: 11, marginTop: 2 }}>{item.stage}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 8 }} className="nonVaLaneGrid">
          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>{active.category}</h3>
                <p style={{ margin: "2px 0 0", color: "#667184", fontSize: 12 }}>{active.trigger}</p>
              </div>
              <Pill label={active.stage} />
            </div>
            <strong style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Possibilities to learn about</strong>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>
              {active.examples.map((example) => (
                <span key={example} style={{ fontSize: 11, fontWeight: 750, padding: "4px 7px", borderRadius: 6, background: "#f4f6f3", color: "#172132", border: "1px solid #edf0ea" }}>{example}</span>
              ))}
            </div>
            <div style={{ padding: "9px 10px", borderRadius: 8, border: "1px solid #edf0ea", background: "#f9fbf7" }}>
              <span style={{ display: "block", color: "#267a56", fontSize: 10, fontWeight: 850, textTransform: "uppercase" as const }}>Question to ask</span>
              <p style={{ margin: "3px 0 0", color: "#172132", fontSize: 12, lineHeight: 1.45 }}>{active.ask}</p>
            </div>
          </div>

          <div style={{ border: "1px solid #d9dfd5", borderRadius: 8, padding: 12 }}>
            <strong style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Evidence to look for</strong>
            {active.evidence.map((item) => (
              <div key={item} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", borderTop: "1px solid #edf0ea", padding: "8px 0" }}>
                <span style={{ color: "#667184", fontSize: 12 }}>{item}</span>
                <Pill label={evidenceStatusFor(item)} />
              </div>
            ))}
            <div style={{ marginTop: 8, padding: "9px 10px", border: "1px solid #b9892244", borderRadius: 8, background: "#fbefd0" }}>
              <strong style={{ display: "block", color: "#8a6319", fontSize: 12 }}>Product rule</strong>
              <p style={{ margin: "3px 0 0", color: "#8a6319", fontSize: 11, lineHeight: 1.4 }}>
                The app should tell the veteran what door exists, what proof may be needed, and who can confirm it.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Knowledge Graph Lab ──────────────────────────────────────────────────────

const graphDocuments = [
  { id: 1, name: "Needed: benefit summary or rating decision", tags: ["VA Decision", "Missing"], verified: false, linkedConditions: [], linkedEvents: ["Current VA status"], notes: "Needed to verify combined rating, individual ratings, effective dates, and reasons." },
  { id: 2, name: "Needed: COE if housing matters", tags: ["Housing", "Missing"], verified: false, linkedConditions: [], linkedEvents: ["VA home loan review"], notes: "Needed to review home loan eligibility, funding-fee status, and entitlement questions." },
  { id: 3, name: "Needed: DD-214 or service verification", tags: ["Service", "Missing"], verified: false, linkedConditions: [], linkedEvents: ["Military service"], notes: "Needed to verify branch, service dates, character of service, and occupation." },
  { id: 4, name: "Needed: medical records", tags: ["Medical", "Missing"], verified: false, linkedConditions: [], linkedEvents: ["Current medical picture"], notes: "Needed to map diagnoses, treatment, current symptoms, and functional impact." },
  { id: 5, name: "Needed: SSDI award/BPQY if applicable", tags: ["SSDI", "Missing"], verified: false, linkedConditions: [], linkedEvents: ["Employment impact"], notes: "Needed only when SSA/SSDI context is part of this veteran's story." },
  { id: 6, name: "Needed: employment timeline if applicable", tags: ["Employment", "Missing"], verified: false, linkedConditions: [], linkedEvents: ["Work history"], notes: "Needed for work impact, TDIU conversations, and vocational context." },
];

const graphConditions = [
  { id: 1, name: "Condition from rating decision", category: "VA condition", vaSC: false, ssdi: false, evidenceItems: [{ label: "Individual rating documented", done: false }, { label: "Diagnostic code or reason documented", done: false }, { label: "Recent treatment records", done: false }, { label: "Current symptom statement", done: false }, { label: "Functional impact documented", done: false }], notes: "Upload the latest rating decision or enter this veteran's condition list to populate the graph.", whatChangedPrompts: ["Current symptoms", "Treatment changes", "Work or daily-life impact"] },
  { id: 2, name: "SSA-recognized condition", category: "SSDI / SSA", vaSC: false, ssdi: false, evidenceItems: [{ label: "SSDI award or BPQY", done: false }, { label: "SSA medical basis", done: false }, { label: "Work history", done: false }, { label: "Functional impact statement", done: false }], notes: "Upload SSA records to compare SSA-recognized conditions with VA service-connected conditions.", whatChangedPrompts: ["SSA onset date", "Work limits", "Medical basis"] },
  { id: 3, name: "Secondary discussion topic", category: "Educational pathway", vaSC: false, ssdi: false, evidenceItems: [{ label: "Current diagnosis", done: false }, { label: "Treatment records", done: false }, { label: "Symptom log", done: false }, { label: "Medical opinion if applicable", done: false }], notes: "Secondary pathways should be generated from this veteran's actual service-connected conditions.", whatChangedPrompts: ["Symptom onset", "Frequency", "Provider notes"] },
  { id: 4, name: "Residual or complication", category: "Residuals", vaSC: false, ssdi: false, evidenceItems: [{ label: "Hospital or operative records", done: false }, { label: "Follow-up care records", done: false }, { label: "Residual symptoms documented by provider", done: false }, { label: "Representative review", done: false }], notes: "Residual lanes need records before anyone can responsibly assess a theory.", whatChangedPrompts: ["Recovery timeline", "Complications", "Residual symptoms"] },
];

const graphEvents = [
  { year: "Service period", label: "Military service", verified: false },
  { year: "Current", label: "VA rating status", verified: false },
  { year: "Current", label: "Current service-connected conditions", verified: false },
  { year: "Current", label: "Medical treatment and medications", verified: false },
  { year: "Current", label: "Employment or SSDI context", verified: false },
  { year: "Current", label: "Housing / COE context", verified: false },
];

function conditionReadiness(c: typeof graphConditions[0]) {
  const done = c.evidenceItems.filter((i) => i.done).length;
  return Math.round((done / c.evidenceItems.length) * 100);
}

function graphOverallReadiness() {
  const total = graphConditions.reduce((sum, c) => sum + conditionReadiness(c), 0);
  return Math.round(total / graphConditions.length);
}

function readinessTone(score: number) {
  if (score >= 80) return "#267a56";
  if (score >= 50) return "#b98922";
  return "#b6504c";
}

export function KnowledgeGraphLab() {
  const [activeTab, setActiveTab] = useState("links");
  const [activeConditionId, setActiveConditionId] = useState(1);
  const [ssdiSelected, setSsdiSelected] = useState<string[]>([]);
  const overallScore = graphOverallReadiness();
  const activeCondition = graphConditions.find((c) => c.id === activeConditionId) || graphConditions[0];

  const tabs = [
    { id: "links", label: "Document links" },
    { id: "score", label: "Evidence score" },
    { id: "changed", label: "What changed?" },
    { id: "packet", label: "Meeting packet" },
    { id: "mapper", label: "SSDI mapper" },
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #d9dfd5", borderRadius: 10, padding: "18px 20px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Veteran Knowledge Graph Lab</h2>
          <p style={{ margin: "3px 0 0", color: "#667184", fontSize: 12 }}>Document links, condition evidence readiness, what changed since last rating, meeting packet, and SSDI mapping.</p>
        </div>
        <span style={{ fontSize: 20, fontWeight: 900, color: readinessTone(overallScore), textAlign: "center" as const }}>
          {overallScore}%<div style={{ fontSize: 10, fontWeight: 400, color: "#667184" }}>evidence</div>
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" as const }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "6px 12px", borderRadius: 6, border: `1.5px solid ${activeTab === tab.id ? "#267a56" : "#d9dfd5"}`, background: activeTab === tab.id ? "#dff3e7" : "#fff", color: activeTab === tab.id ? "#267a56" : "#667184", fontWeight: activeTab === tab.id ? 700 : 400, fontSize: 12, cursor: "pointer" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Links */}
      {activeTab === "links" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[{ label: "Total documents", value: graphDocuments.length }, { label: "Verified", value: graphDocuments.filter((d) => d.verified).length }, { label: "Still needed", value: graphDocuments.filter((d) => !d.verified).length }, { label: "Unlinked", value: graphDocuments.filter((d) => d.linkedConditions.length === 0 && d.linkedEvents.length === 0).length }].map((stat) => (
              <div key={stat.label} style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7, textAlign: "center" as const }}>
                <strong style={{ fontSize: 22, fontWeight: 900 }}>{stat.value}</strong>
                <div style={{ fontSize: 11, color: "#667184" }}>{stat.label}</div>
              </div>
            ))}
          </div>
          {graphDocuments.map((doc) => (
            <div key={doc.id} style={{ padding: "10px 12px", border: `1px solid ${doc.verified ? "#d9dfd5" : "#b6504c44"}`, borderRadius: 7, marginBottom: 6, background: doc.verified ? "#fff" : "#fff8f8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 13 }}>{doc.name}</strong>
                <span style={{ fontSize: 11, fontWeight: 700, color: doc.verified ? "#267a56" : "#b6504c" }}>{doc.verified ? "Verified" : "Needed"}</span>
              </div>
              <p style={{ margin: "3px 0 4px", fontSize: 12, color: "#667184" }}>{doc.notes}</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                {doc.tags.map((t) => <span key={t} style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "#f4f6f3", color: "#267a56", fontWeight: 600 }}>{t}</span>)}
              </div>
              {doc.linkedConditions.length > 0 && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#667184" }}><b>Conditions:</b> {doc.linkedConditions.join(", ")}</p>}
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#667184" }}><b>Events:</b> {doc.linkedEvents.length ? doc.linkedEvents.join(", ") : "None yet"}</p>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Score */}
      {activeTab === "score" && (
        <div>
          <div style={{ padding: "12px 14px", borderRadius: 8, background: readinessTone(overallScore) + "11", border: `1px solid ${readinessTone(overallScore)}44`, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#667184" }}>Overall evidence completeness</span>
            <div style={{ fontSize: 36, fontWeight: 900, color: readinessTone(overallScore) }}>{overallScore}%</div>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#667184" }}>Focus on red conditions first. Each checklist item turns a vague concern into a document or appointment request.</p>
          </div>
          {[...graphConditions].sort((a, b) => conditionReadiness(a) - conditionReadiness(b)).map((condition) => {
            const score = conditionReadiness(condition);
            const done = condition.evidenceItems.filter((i) => i.done).length;
            return (
              <div key={condition.id} style={{ padding: "12px 14px", border: "1px solid #d9dfd5", borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div><strong style={{ fontSize: 14 }}>{condition.name}</strong><span style={{ fontSize: 11, color: "#667184", marginLeft: 8 }}>{condition.category}</span></div>
                  <strong style={{ color: readinessTone(score), fontSize: 16 }}>{score}%</strong>
                </div>
                <div style={{ height: 6, background: "#f4f6f3", borderRadius: 3, marginBottom: 6 }}>
                  <div style={{ height: 6, width: `${score}%`, background: readinessTone(score), borderRadius: 3 }} />
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#667184" }}>{done}/{condition.evidenceItems.length} evidence items present</p>
                {condition.evidenceItems.map((item) => (
                  <div key={item.label} style={{ fontSize: 12, color: item.done ? "#267a56" : "#b6504c", marginBottom: 2 }}>
                    {item.done ? "✓" : "✗"} {item.label}
                  </div>
                ))}
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "#667184" }}>{condition.notes}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* What Changed */}
      {activeTab === "changed" && (
        <div>
          <div style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 12 }}>
            <strong style={{ fontSize: 13 }}>The question a VSO will ask</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#667184" }}>"What is different today than when VA last rated this condition?" This module helps turn that answer into a focused evidence request.</p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 12 }}>
            {graphConditions.map((c) => (
              <button key={c.id} onClick={() => setActiveConditionId(c.id)} style={{ padding: "5px 10px", borderRadius: 6, border: `1.5px solid ${activeConditionId === c.id ? "#267a56" : "#d9dfd5"}`, background: activeConditionId === c.id ? "#dff3e7" : "#fff", color: activeConditionId === c.id ? "#267a56" : "#667184", fontWeight: activeConditionId === c.id ? 700 : 400, fontSize: 12, cursor: "pointer" }}>
                {c.name}
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 14px", border: "1px solid #d9dfd5", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div><strong style={{ fontSize: 14 }}>{activeCondition.name}</strong><span style={{ fontSize: 11, color: "#667184", marginLeft: 8 }}>{activeCondition.category} · Evidence {conditionReadiness(activeCondition)}%</span></div>
              <span style={{ fontSize: 11, fontWeight: 700, color: activeCondition.vaSC ? "#267a56" : "#b6504c" }}>{activeCondition.vaSC ? "VA SC" : "Not SC"}</span>
            </div>
            <label style={{ display: "block" }}>
              <span style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>What changed since the last rating?</span>
              <textarea placeholder="Symptoms, frequency, severity, new treatment, new limitations, new tests, hospitalizations, or daily-life impact." style={{ width: "100%", minHeight: 80, padding: "8px 10px", borderRadius: 7, border: "1px solid #d9dfd5", fontSize: 13, resize: "vertical" as const, boxSizing: "border-box" as const }} />
            </label>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" as const }}>
              {activeCondition.whatChangedPrompts.map((p) => <span key={p} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: "#f4f6f3", color: "#667184" }}>{p}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Packet */}
      {activeTab === "packet" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>Verified story</span>
              {graphEvents.filter((e) => e.verified).map((e) => <p key={e.year} style={{ margin: "4px 0 0", fontSize: 12 }}><b>{e.year}</b> {e.label}</p>)}
            </div>
            <div style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#b6504c", textTransform: "uppercase" as const }}>Evidence gaps</span>
              {graphDocuments.filter((d) => !d.verified).map((d) => <p key={d.id} style={{ margin: "4px 0 0", fontSize: 12 }}><b>{d.name}</b> — {d.notes}</p>)}
            </div>
          </div>
          <div style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>VSO-ready questions</span>
            <ol style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {["For conditions that appear in both VA and SSA evidence, what individual ratings are assigned and which are evidence-ready for review?", "For evidence-gap conditions, what specific records should be gathered first?", "How should surgeries, hospitalizations, complications, scars, residual symptoms, and monitoring be developed before any theory is considered?", "Which path best matches the veteran's work, education, business, or retirement goals?"].map((q, i) => <li key={i} style={{ fontSize: 12, color: "#667184", marginBottom: 4 }}>{q}</li>)}
            </ol>
          </div>
          <p style={{ fontSize: 11, color: "#b98922", textAlign: "center" as const }}>Preparation tool only. Review with an accredited VSO, claims attorney, or qualified representative before filing.</p>
        </div>
      )}

      {/* SSDI Mapper */}
      {activeTab === "mapper" && (
        <div>
          <div style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 12 }}>
            <strong style={{ fontSize: 13 }}>{ssdiSelected.length >= 3 ? "Strong SSDI-to-SC overlap" : ssdiSelected.length ? "Partial overlap" : "No SSDI conditions selected"}</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#667184" }}>VA records list adjudicated service-connected conditions. SSA records list what SSA recognized as disabling. Where they overlap, the app can build better educational questions for representative review.</p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 12 }}>
            {graphConditions.map((c) => (
              <button key={c.id} onClick={() => setSsdiSelected((prev) => prev.includes(c.name) ? prev.filter((n) => n !== c.name) : [...prev, c.name])} style={{ padding: "6px 10px", borderRadius: 6, border: `1.5px solid ${ssdiSelected.includes(c.name) ? "#267a56" : "#d9dfd5"}`, background: ssdiSelected.includes(c.name) ? "#dff3e7" : "#fff", color: ssdiSelected.includes(c.name) ? "#267a56" : "#667184", fontWeight: ssdiSelected.includes(c.name) ? 700 : 400, fontSize: 12, cursor: "pointer" }}>
                {c.name}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 13 }}>Matched conditions</h3>
              {graphConditions.filter((c) => ssdiSelected.includes(c.name)).map((c) => <p key={c.id} style={{ margin: "0 0 4px", fontSize: 12 }}>{c.name} <span style={{ color: "#267a56", fontSize: 11 }}>VA-adjudicated + SSA-recognized</span></p>)}
              {ssdiSelected.length === 0 && <p style={{ fontSize: 12, color: "#667184" }}>None selected yet.</p>}
            </div>
            <div style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 13 }}>Not matched yet</h3>
              {graphConditions.filter((c) => !ssdiSelected.includes(c.name)).map((c) => <p key={c.id} style={{ margin: "0 0 4px", fontSize: 12 }}>{c.name} <span style={{ color: "#667184", fontSize: 11 }}>Research evidence lane</span></p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Claim Review Coach ───────────────────────────────────────────────────────

export function ClaimReviewCoach() {
  const [claimStrength] = useState(0);

  return (
    <div style={{ background: "#fff", border: "1px solid #d9dfd5", borderRadius: 10, padding: "18px 20px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Claim Review Coach</h2>
          <p style={{ margin: "3px 0 0", color: "#667184", fontSize: 12 }}>Internal research assistant for potential 90-to-100 paths. Surfaces review areas, evidence gaps, and VSO-ready questions without making entitlement claims.</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid #b98922", color: "#b98922", whiteSpace: "nowrap" as const }}>Review with accredited help before filing</span>
      </div>

      {/* Phase 1 */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>Phase 1 — Veteran Profile</span>
        <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
          {[{ label: "MOS/AFSC", value: "Add military occupation from DD-214 or service records" }, { label: "Medical events", value: "Add surgeries, hospitalizations, injuries, or major diagnoses from records" }, { label: "Medications", value: "Add current medication list and prescribing source" }, { label: "Dependents", value: "Add spouse, child, parent, caregiver, or none" }].map((item) => (
            <div key={item.label} style={{ padding: "8px 10px", border: "1px solid #d9dfd5", borderRadius: 7, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#267a56", minWidth: 100 }}>{item.label}</span>
              <span style={{ fontSize: 12, color: "#172132" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 2 */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>Phase 2 — Opportunity Scanner</span>
        <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
          {[{ status: "Review", title: "Schedular rating path", text: "Needs individual ratings, current symptoms, worsening evidence, and accredited review." }, { status: "Research", title: "Secondary conditions", text: "Use currently service-connected conditions as the starting map for educational discussion topics." }, { status: "Investigate", title: "Residuals and major medical events", text: "Surgeries, hospitalizations, scars, nerve symptoms, and follow-up care should be organized before VSO review." }].map((item) => (
            <div key={item.title} style={{ padding: "8px 10px", border: "1px solid #d9dfd5", borderRadius: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(item.status), textTransform: "uppercase" as const }}>{item.status}</span>
              <strong style={{ display: "block", fontSize: 13 }}>{item.title}</strong>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#667184" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 3 */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>Phase 3 — Evidence Readiness</span>
        <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
          {[{ label: "Ready", title: "Uploaded evidence", text: "Uploaded documents can support benefit verification after they are associated with this veteran." }, { label: "Needs evidence", title: "Rating and symptom map", text: "Need individual ratings, last exam dates, worsening evidence, and functional impact statements." }, { label: "Insufficient", title: "New or residual review theory", text: "Need medical records, diagnosis links, chronology, nexus theory, and accredited review." }].map((item) => (
            <div key={item.title} style={{ padding: "8px 10px", border: "1px solid #d9dfd5", borderRadius: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(item.label), textTransform: "uppercase" as const }}>{item.label}</span>
              <strong style={{ display: "block", fontSize: 13 }}>{item.title}</strong>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#667184" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 4 */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>Phase 4 — Claim Strength</span>
        <div style={{ padding: "12px 14px", border: "1px solid #d9dfd5", borderRadius: 7, marginTop: 6, textAlign: "center" as const }}>
          <div style={{ fontSize: 48, fontWeight: 900 }}>{claimStrength}<span style={{ fontSize: 16, fontWeight: 400, color: "#667184" }}>/100</span></div>
          <div style={{ fontSize: 12, color: "#667184", marginBottom: 6 }}>support level</div>
          <div style={{ height: 8, background: "#f4f6f3", borderRadius: 4 }}>
            <div style={{ height: 8, width: `${claimStrength}%`, background: "#b98922", borderRadius: 4 }} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#667184" }}>This starts at zero until this veteran's individual ratings, records, functional impact, and representative-reviewed evidence are entered.</p>
        </div>
      </div>

      {/* Phase 5 */}
      <div>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#267a56", textTransform: "uppercase" as const }}>Phase 5 — Personal Statement Assistant</span>
        <div style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7, marginTop: 6 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#667184" }}>Organize chronology, symptoms, treatment history, work impact, flare-ups, and daily limitations. No invented facts.</p>
          <button style={{ padding: "7px 14px", borderRadius: 6, border: "1px solid #d9dfd5", background: "#f4f6f3", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Build outline →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Document Translator ──────────────────────────────────────────────────────

export function DocumentTranslator() {
  const docs = [
    { name: "Benefit summary", says: "Shows current combined rating, payment information, and some status indicators.", matters: "Anchors current VA status and separates verified benefits from conditional benefits." },
    { name: "Rating decision", says: "Explains individual conditions, ratings, effective dates, evidence considered, and reasons for decision.", matters: "Creates the evidence map for increases, secondary-condition discussions, appeals, or missing documentation." },
    { name: "Home-loan COE", says: "Shows VA loan eligibility, funding-fee status, and entitlement information.", matters: "Turns home buying into concrete questions about lender review, entitlement, restoration, and state property benefits." },
    { name: "Civil-service letter", says: "May confirm service-connected compensation level for federal employment preference.", matters: "Supports federal hiring preference and employment-related benefit lanes outside claims." },
    { name: "DD-214 / service verification", says: "Shows branch, service dates, character of service, and military occupation when available.", matters: "Primary service verification for many VA, state, county, education, employment, and recreation benefits." },
    { name: "SSA / SSDI records", says: "May show SSA disability status, onset date, Medicare timing, work history, and medical basis.", matters: "Helps compare SSA and VA evidence while keeping the two systems legally separate." },
    { name: "Medication list / treatment records", says: "Shows active care, medication burden, specialist visits, tests, and current symptoms.", matters: "Documents the current medical picture and functional impact for VSO conversations." },
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #d9dfd5", borderRadius: 10, padding: "18px 20px", marginBottom: 12 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>Document Translator</h2>
      <p style={{ margin: "0 0 12px", color: "#667184", fontSize: 12 }}>What each document says and why it matters to your case.</p>
      {docs.map((doc) => (
        <div key={doc.name} style={{ padding: "10px 12px", border: "1px solid #d9dfd5", borderRadius: 7, marginBottom: 7 }}>
          <strong style={{ fontSize: 14, color: "#172132" }}>{doc.name}</strong>
          <p style={{ margin: "4px 0 2px", fontSize: 12 }}><span style={{ fontWeight: 700 }}>Says:</span> {doc.says}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#267a56" }}><span style={{ fontWeight: 700 }}>Why it matters:</span> {doc.matters}</p>
        </div>
      ))}
    </div>
  );
}
