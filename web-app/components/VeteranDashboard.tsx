"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { deleteDocument, deleteDuplicateDocuments } from "@/app/actions";

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

const documentCategoryLabels: Record<string, string> = Object.fromEntries(
  evidenceConfig.map((item) => [item.docCategory, item.category])
);

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
  if (!value) return "Florida";
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

const lifeEvents = [
  { when: "1985-1988", event: "Air Force service", evidence: "DD-214 / service verification", impact: "Eligibility foundation", status: "Verified", detail: "Service records verify honorable Air Force service." },
  { when: "~2007", event: "First aneurysm history", evidence: "Hospital records needed", impact: "Major", status: "Unconfirmed", detail: "Exact event, records, facility, and diagnosis timeline needed." },
  { when: "2023", event: "Emergency hospitalization", evidence: "UF / hospital records needed", impact: "Major", status: "Unconfirmed", detail: "Transport records, ER notes, and discharge summary should be gathered." },
  { when: "2025", event: "Major aortic repair", evidence: "Operative report / surgical records", impact: "Major", status: "Unconfirmed", detail: "Surgeon notes, procedure report, complications, and follow-up plan needed." },
  { when: "2025", event: "Dialysis episode", evidence: "Nephrology records needed", impact: "Major", status: "Unconfirmed", detail: "Duration, cause, facility, and relation to surgery need documentation." },
  { when: "Current", event: "Residual numbness and monitoring", evidence: "Neurology notes / follow-up care", impact: "Active", status: "Investigate", detail: "Provider notes, neuro findings, scar documentation, and current limitations needed." },
  { when: "2026", event: "Current VA/FMP evidence", evidence: "Benefit summary / FMP letter", impact: "Benefit lanes", status: "Verified", detail: "VA letters verify rating status, FMP condition list, preference, and loan eligibility." },
];

const conditionMatrix = [
  { condition: "Sleep apnea", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Yellow" },
  { condition: "Depression", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Yellow" },
  { condition: "Lumbar spine", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Red" },
  { condition: "Radiculopathy", va: "Yes", ssdi: "Unknown", rating: "?", lastExam: "?", worsening: "Ask", ready: "Red" },
  { condition: "Aortic residuals", va: "Unknown", ssdi: "Unknown", rating: "N/A", lastExam: "Recent", worsening: "Investigate", ready: "Red" },
];

const secondaryConditions = [
  {
    condition: "Tinnitus",
    rating: "10%",
    pathways: [
      { topic: "Headaches / migraines", needs: ["Diagnosis", "Treatment records", "Symptom log", "Medical opinion"], questions: ["Should headaches be reviewed as a possible secondary discussion topic?", "Would a headache log or neurology visit help clarify the record?"] },
      { topic: "Vertigo / balance symptoms", needs: ["Diagnosis", "ENT or neurology records", "Symptom documentation", "Medication or treatment notes"], questions: ["Has vertigo or balance disturbance been fully developed in the record?", "Are ENT or vestibular records needed before any representative review?"] },
      { topic: "Sleep disturbance", needs: ["Sleep notes", "Treatment records", "Symptom documentation", "Functional impact statement"], questions: ["Is sleep disturbance already accounted for elsewhere?", "Would updated sleep or mental health records clarify the picture?"] },
    ],
  },
  {
    condition: "Depression",
    rating: "30%",
    pathways: [
      { topic: "Occupational impairment review", needs: ["Mental health notes", "Medication history", "Work-impact statement", "Therapy records"], questions: ["Does the current evidence accurately describe occupational impairment?", "Are updated treatment records needed?"] },
      { topic: "Social impairment review", needs: ["Therapy records", "Personal statement", "Buddy statement", "Medication history"], questions: ["Does the record capture social impairment and daily-function limits?", "Would a personal statement help organize the timeline?"] },
      { topic: "Chronic pain and sleep impact", needs: ["Pain records", "Sleep documentation", "Mental health notes", "Functional impact statement"], questions: ["Should chronic pain or sleep disruption be discussed as part of the mental health evidence picture?", "Are symptoms already captured under another condition?"] },
    ],
  },
  {
    condition: "Lumbar DDD",
    rating: "20%",
    pathways: [
      { topic: "Radiculopathy progression", needs: ["Neurology exam", "Imaging", "Pain treatment records", "Functional loss statement"], questions: ["Are neurological symptoms fully captured?", "Are current records sufficient to describe progression?"] },
      { topic: "Additional nerve involvement", needs: ["Nerve study", "Specialist visit", "Laterality documentation", "Symptom frequency"], questions: ["Is there evidence of additional nerve involvement or changed laterality?", "Would a current neurological exam clarify symptoms?"] },
      { topic: "Mobility and functional loss", needs: ["Range of motion exam", "Physical therapy records", "Assistive device notes", "Flare-up statement"], questions: ["Does the record describe flare-ups, walking, sitting, lifting, and standing limits?", "Is a functional impact statement missing?"] },
    ],
  },
  {
    condition: "Cervical arthritis",
    rating: "20%",
    pathways: [
      { topic: "Upper extremity nerve symptoms", needs: ["Neurology records", "Imaging", "Treatment notes", "Symptom description"], questions: ["Are arm, hand, numbness, or weakness symptoms documented?", "Would specialist notes help separate cervical and lumbar symptoms?"] },
      { topic: "Headache or neck-related symptoms", needs: ["Diagnosis", "Treatment records", "Symptom log", "Medical opinion"], questions: ["Should headache patterns be discussed with the representative?", "Is there enough documentation to understand frequency and impact?"] },
    ],
  },
  {
    condition: "Bilateral radiculopathy",
    rating: "20% each side",
    pathways: [
      { topic: "Symptom progression", needs: ["Neurology exam", "Medication references", "Pain records", "Functional impact statement"], questions: ["Are current symptoms worse, more frequent, or affecting mobility?", "Are both sides accurately documented?"] },
      { topic: "Falls, weakness, or mobility limits", needs: ["Fall history", "Assistive device notes", "Physical therapy records", "Provider documentation"], questions: ["Are weakness, falls, balance, or assistive devices documented?", "Should mobility limitations be organized before a VSO meeting?"] },
    ],
  },
  {
    condition: "Sleep apnea",
    rating: "50%",
    pathways: [
      { topic: "Fatigue / cognitive symptoms", needs: ["Sleep treatment records", "CPAP records", "Symptom statement", "Medication history"], questions: ["Are fatigue and concentration symptoms documented separately from other conditions?", "Are CPAP compliance or sleep clinic records available?"] },
      { topic: "Mental health and sleep interaction", needs: ["Mental health notes", "Sleep records", "Medication history", "Functional impact statement"], questions: ["Do sleep and mental health records tell the same story?", "Would updated treatment notes clarify symptom overlap?"] },
    ],
  },
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
  return match ? Number(match[0]) : 90;
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
  const [understanding, setUnderstanding] = useState([true, true, true, false, false, false]);
  const [protocol, setProtocol] = useState([true, true, false, false]);
  const [briefCopied, setBriefCopied] = useState(false);

  const branch = profile?.branch || "Air Force";
  const state = stateDisplay(profile?.state);
  const rating = ratingDisplay(profile?.current_rating);
  const cat = categories.find((c) => c.name === selectedCat) || categories[0];
  const vaultGroups = dedupeDocuments(documents);

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
        <div style={{ textAlign: "center" as const, marginBottom: 14, minWidth: 120 }}>
          <div style={{ display: "inline-flex", flexDirection: "column" as const, alignItems: "center", whiteSpace: "nowrap" as const }}>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 0.95, whiteSpace: "nowrap" as const }}>94</div>
            <div style={{ fontSize: 12, color: "#667184", whiteSpace: "nowrap" as const }}>ready</div>
          </div>
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

export function NonVaBenefits({ profile }: { profile: Profile }) {
  const state = stateDisplay(profile?.state);
  const branch = profile?.branch || "Air Force";
  const rating = ratingDisplay(profile?.current_rating);
  const benefitSource = branchBenefitSource(branch);
  const selectedStateLanes = nationwideStateBenefitLanes(state, branch);
  const readyCount = selectedStateLanes.filter((lane) => ["Ready", "Strong", "High", "Likely", "Start Here", "Federal", "Branch"].includes(lane.level)).length;

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#172132" }}>
      <Card
        title="Non-VA Benefits Navigator"
        sub={`State, federal, county, retail, housing, and career opportunities for a ${branch} veteran in ${state} with ${rating} service connection.`}
        badge={`${readyCount} priority lanes`}
      >
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
          <a href={stateBenefitsUrl(state, branch)} target="_blank" rel="noreferrer" style={{ color: "#315f9e", fontSize: 12, fontWeight: 850, whiteSpace: "nowrap", textDecoration: "none" }}>
            Open state guide
          </a>
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

// ─── Knowledge Graph Lab ──────────────────────────────────────────────────────

const graphDocuments = [
  { id: 1, name: "benefit_summary.pdf", tags: ["VA Decision"], verified: true, linkedConditions: [], linkedEvents: ["VA rating - 90% SC"], notes: "90% combined, $2,362.30/mo, not P&T." },
  { id: 2, name: "certificate_of_eligibility_home_loan.pdf", tags: ["VA Decision", "Housing"], verified: true, linkedConditions: [], linkedEvents: ["VA home loan COE"], notes: "Chapter 37 eligible, funding-fee exempt, $87,575 prior entitlement charged." },
  { id: 3, name: "service_verification.pdf", tags: ["Service"], verified: true, linkedConditions: [], linkedEvents: ["Air Force service"], notes: "Confirms honorable Air Force service Aug. 20, 1985 to May 24, 1988." },
  { id: 4, name: "proof_of_service.pdf", tags: ["Service"], verified: true, linkedConditions: [], linkedEvents: ["Air Force service"], notes: "Proof of honorable service document." },
  { id: 5, name: "foreign_medical_program.pdf", tags: ["Medical", "VA Decision"], verified: true, linkedConditions: ["Sleep apnea", "Depression", "Lumbar spine", "Radiculopathy", "Tinnitus", "Knee condition", "Skin condition"], linkedEvents: ["VA rating - 90% SC"], notes: "FMP authorized and lists VA-adjudicated service-connected conditions." },
  { id: 6, name: "civil_service.pdf", tags: ["Employment"], verified: true, linkedConditions: [], linkedEvents: ["Federal preference"], notes: "30%+ SC preference confirmed for federal hiring lane." },
  { id: 7, name: "Needed: SSDI award/BPQY", tags: ["SSDI", "Missing"], verified: false, linkedConditions: ["Sleep apnea", "Depression", "Lumbar spine", "Radiculopathy"], linkedEvents: ["Employment impact"], notes: "Needed to confirm the SSA-recognized medical basis." },
  { id: 8, name: "Needed: aortic surgery records", tags: ["Surgery", "Missing"], verified: false, linkedConditions: ["Aortic / vascular residuals"], linkedEvents: ["Major aortic surgery", "Dialysis episode", "Residual numbness"], notes: "Needed for operative chronology, follow-up care, scars, dialysis, and residual symptoms." },
];

const graphConditions = [
  { id: 1, name: "Sleep apnea", category: "Respiratory", vaSC: true, ssdi: true, evidenceItems: [{ label: "Diagnosis documented", done: true }, { label: "CPAP prescription on file", done: true }, { label: "Recent treatment records within 12 months", done: false }, { label: "Current symptom statement", done: false }, { label: "Functional impact documented", done: false }], notes: "CPAP prescribed. Need current functional impact when sleep is disrupted.", whatChangedPrompts: ["CPAP tolerance or failures", "Daytime fatigue", "Work or concentration impact"] },
  { id: 2, name: "Depression", category: "Mental health", vaSC: true, ssdi: true, evidenceItems: [{ label: "Diagnosis documented", done: true }, { label: "Treatment history", done: false }, { label: "Secondary nexus to pain or sleep documented", done: false }, { label: "Current symptom statement", done: false }, { label: "Functional impact on daily life", done: false }], notes: "Potentially connected to chronic pain and sleep disruption; needs provider records.", whatChangedPrompts: ["Mood changes", "Sleep and pain interaction", "Social or work impairment"] },
  { id: 3, name: "Lumbar spine", category: "Musculoskeletal", vaSC: true, ssdi: true, evidenceItems: [{ label: "Original diagnosis on file", done: true }, { label: "Recent imaging", done: false }, { label: "Range of motion documented", done: false }, { label: "Current treatment records", done: false }, { label: "Functional limitation statement", done: false }], notes: "Needs recent imaging, range-of-motion evidence, and daily limitation details.", whatChangedPrompts: ["Mobility loss", "Flare frequency", "Sitting, standing, lifting limits"] },
  { id: 4, name: "Radiculopathy", category: "Neurological", vaSC: true, ssdi: true, evidenceItems: [{ label: "Diagnosis documented", done: true }, { label: "Nexus to lumbar spine documented", done: false }, { label: "Nerve study or neurological exam", done: false }, { label: "Symptom frequency and severity statement", done: false }], notes: "Likely tied to lumbar spine, but severity and laterality need stronger documentation.", whatChangedPrompts: ["Numbness pattern", "Pain radiation", "Falls, weakness, or foot symptoms"] },
  { id: 5, name: "Aortic / vascular residuals", category: "Cardiovascular", vaSC: false, ssdi: false, evidenceItems: [{ label: "Operative records for aortic surgery", done: false }, { label: "Dialysis episode records", done: false }, { label: "Post-surgical follow-up records", done: false }, { label: "Residual numbness documented by provider", done: false }, { label: "Scar documentation", done: false }, { label: "Nexus theory reviewed by accredited help", done: false }], notes: "Major unexplored lane. Needs records before anyone can responsibly assess a theory.", whatChangedPrompts: ["Surgery recovery", "Dialysis duration", "Residual numbness, scars, monitoring"] },
];

const graphEvents = [
  { year: "1985-1988", label: "Air Force service", verified: true },
  { year: "Apr 2026", label: "VA rating - 90% SC", verified: true },
  { year: "Unknown", label: "Sleep apnea onset / CPAP", verified: false },
  { year: "~2007", label: "Aortic event - initial diagnosis", verified: false },
  { year: "2025", label: "Major aortic surgery", verified: false },
  { year: "2025", label: "Dialysis episode", verified: false },
  { year: "2025-now", label: "Residual numbness and monitoring", verified: false },
  { year: "Mar 2026", label: "VA home loan COE", verified: true },
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
  const [ssdiSelected, setSsdiSelected] = useState(["Sleep apnea", "Depression", "Lumbar spine", "Radiculopathy"]);
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
              {["For dual-confirmed conditions (Sleep apnea, Depression, Lumbar spine, Radiculopathy), what individual ratings are currently assigned and which are evidence-ready for schedular review?", "For evidence-gap conditions, what specific records should be gathered first?", "How should aortic surgery, dialysis episode, residual numbness, scars, and monitoring be developed before any claim theory is considered?", "Given the preference for schedular review, what path preserves future consulting or employment options?"].map((q, i) => <li key={i} style={{ fontSize: 12, color: "#667184", marginBottom: 4 }}>{q}</li>)}
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
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#667184" }}>Your FMP authorization lists VA-adjudicated conditions. Your SSDI file lists what SSA recognized as disabling. Where they overlap, the app can build better questions for schedular review.</p>
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
  const [claimStrength] = useState(62);

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
          {[{ label: "AFSC/MOS", value: "27132 – APR Operations Resources / Flight Ops Specialist" }, { label: "Surgeries", value: "Aortic aneurysm history; major aortic surgery 2025; dialysis episode 2025" }, { label: "Medications", value: "Sacubitril/Valsartan, Metoprolol, Rivaroxaban, Amlodipine, Empagliflozin, Rosuvastatin, Famotidine" }, { label: "Dependents", value: "None" }].map((item) => (
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
          {[{ status: "Review", title: "Schedular 90-to-100 path", text: "Preserves future work and consulting options. Needs individual ratings, worsening evidence, and secondary/residual theories." }, { status: "Research", title: "Secondary conditions", text: "Use spine, radiculopathy, sleep apnea, depression, knee, tinnitus, and skin conditions as the starting map." }, { status: "Investigate", title: "Post-surgical residuals", text: "Aortic surgery, aneurysm history, dialysis episode, numbness, scars, and follow-up care should be organized for VSO review." }].map((item) => (
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
          {[{ label: "Ready", title: "Service, rating, COE, FMP, civil preference", text: "Core documents are captured and can support benefit verification." }, { label: "Needs evidence", title: "Schedular increase map", text: "Need individual ratings, last exam dates, worsening evidence, and functional impact statements." }, { label: "Insufficient", title: "Surgery residual claim theory", text: "Need medical records, diagnosis links, chronology, nexus theory, and accredited review." }].map((item) => (
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
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#667184" }}>Improves with individual ratings, SSDI basis, specialist notes, functional impact, and nexus clarification.</p>
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
    { name: "Benefit summary", says: "90% combined, monthly award, not P&T.", matters: "Anchors current VA status and separates verified benefits from conditional P&T-only benefits." },
    { name: "FMP authorization", says: "Lists VA-adjudicated service-connected conditions.", matters: "Creates the condition map for health care abroad, secondary-condition research, and schedular evidence review." },
    { name: "Home-loan COE", says: "VA loan eligible, funding-fee exempt, prior entitlement charged.", matters: "Turns home buying from a vague goal into entitlement restoration and remaining-entitlement questions." },
    { name: "Civil-service letter", says: "Honorable separation and 30%+ service-connected compensation.", matters: "Supports federal hiring preference and confirms a benefit lane outside claims." },
    { name: "DD-214", says: "Air Force, E-3, honorable discharge Aug 1985 – May 1988, AFSC 27132.", matters: "Primary service verification for all VA benefits; establishes eligibility foundation." },
    { name: "SSA Benefit Verification", says: "SSDI $2,994/mo, disabled June 20, 2020, Medicare enrolled Dec 2022.", matters: "Confirms SSA disability basis, onset date, and Medicare coverage — critical for SSDI-to-SC mapping." },
    { name: "Medication list", says: "Heart, blood pressure, blood thinner, diabetes, cholesterol, eye, and GI medications from Orlando VAMC.", matters: "Documents active treatment and functional burden; supports worsening and secondary condition evidence." },
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
