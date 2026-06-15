import { upsertProfile } from "@/app/actions";

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  "District of Columbia", "Puerto Rico", "Guam", "U.S. Virgin Islands", "American Samoa",
  "Northern Mariana Islands",
];

const branches = [
  "Air Force",
  "Army",
  "Navy",
  "Marine Corps",
  "Coast Guard",
  "Space Force",
  "National Guard",
  "Reserve",
  "Multiple / Family",
];

const stateAliases: Record<string, string> = {
  FL: "Florida",
  DC: "District of Columbia",
};

const ratingOptions = ["", "0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];
const ptOptions = ["", "No", "Yes", "Unknown"];
const serviceOptions = ["", "Honorable", "General under honorable conditions", "Other / verify"];
const dependentOptions = ["", "None", "Spouse", "Child / children", "Spouse and child / children", "Dependent parent", "Other / verify"];

type Profile = {
  display_name: string | null;
  branch: string | null;
  state: string | null;
  current_rating: string | null;
  rank_pay_grade?: string | null;
  service_status?: string | null;
  work_status: string | null;
  dependent_status: string | null;
  permanent_total_status?: string | null;
  monthly_award?: string | null;
  va_loan_status?: string | null;
  federal_preference_status?: string | null;
  fmp_status?: string | null;
} | null;

export function ProfileForm({ profile }: { profile: Profile }) {
  const savedRating = profile?.current_rating || "";
  const rankFromRating = /^(E|O|W)-?[0-9]$/i.test(savedRating) ? savedRating.toUpperCase().replace(/^([EOW])([0-9])$/, "$1-$2") : "";
  const normalizedState = stateAliases[(profile?.state || "").toUpperCase()] || profile?.state || "";
  const fields = [
    { name: "display_name", label: "Preferred display name", placeholder: "Preferred name", value: profile?.display_name || "" },
    { name: "rank_pay_grade", label: "Rank / pay grade", placeholder: "Example: E-5", value: profile?.rank_pay_grade || rankFromRating },
    { name: "work_status", label: "Current work / SSDI status", placeholder: "Example: working, unemployed, retired, SSDI", value: profile?.work_status || "" },
    { name: "monthly_award", label: "Monthly VA award", placeholder: "Optional", value: profile?.monthly_award || "" },
    { name: "va_loan_status", label: "VA loan status", placeholder: "Optional", value: profile?.va_loan_status || "" },
    { name: "federal_preference_status", label: "Federal preference", placeholder: "Optional", value: profile?.federal_preference_status || "" },
    { name: "fmp_status", label: "Foreign Medical Program", placeholder: "Optional", value: profile?.fmp_status || "" },
  ];

  return (
    <form className="facts" action={upsertProfile}>
      {fields.map((field) => (
        <label key={field.name} className="factField">
          <span>{field.label}</span>
          <input name={field.name} placeholder={field.placeholder} defaultValue={field.value} />
        </label>
      ))}
      <label className="factField">
        <span>Branch or component</span>
        <select name="branch" defaultValue={profile?.branch || ""}>
          <option value="">Select branch or component</option>
          {branches.map((branch) => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </select>
      </label>
      <label className="factField">
        <span>Current combined VA rating</span>
        <select name="current_rating" defaultValue={/^(E|O|W)-?[0-9]$/i.test(savedRating) ? "" : savedRating}>
          {ratingOptions.map((rating) => (
            <option key={rating || "blank"} value={rating}>{rating || "Select rating"}</option>
          ))}
        </select>
      </label>
      <label className="factField">
        <span>Service characterization</span>
        <select name="service_status" defaultValue={profile?.service_status || ""}>
          {serviceOptions.map((status) => (
            <option key={status || "blank"} value={status}>{status || "Select service status"}</option>
          ))}
        </select>
      </label>
      <label className="factField">
        <span>State or territory of residence</span>
        <select name="state" defaultValue={normalizedState}>
          <option value="">Select state or territory</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </label>
      <label className="factField">
        <span>Permanent and total status</span>
        <select name="permanent_total_status" defaultValue={profile?.permanent_total_status || ""}>
          {ptOptions.map((status) => (
            <option key={status || "blank"} value={status}>{status || "Select P&T status"}</option>
          ))}
        </select>
      </label>
      <label className="factField">
        <span>Marital / dependent status</span>
        <select name="dependent_status" defaultValue={profile?.dependent_status === "0" ? "None" : profile?.dependent_status || ""}>
          {dependentOptions.map((status) => (
            <option key={status || "blank"} value={status}>{status || "Select dependent status"}</option>
          ))}
        </select>
      </label>
      <button className="primaryButton" type="submit">Save profile</button>
    </form>
  );
}
