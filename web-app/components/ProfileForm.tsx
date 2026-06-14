import { upsertProfile } from "@/app/actions";

type Profile = {
  display_name: string | null;
  branch: string | null;
  state: string | null;
  current_rating: string | null;
  work_status: string | null;
  dependent_status: string | null;
} | null;

export function ProfileForm({ profile }: { profile: Profile }) {
  const fields = [
    { name: "display_name", label: "Preferred display name", placeholder: "Mark Chambers", value: profile?.display_name || "" },
    { name: "branch", label: "Branch of service", placeholder: "Air Force", value: profile?.branch || "" },
    { name: "state", label: "State of residence", placeholder: "Florida", value: profile?.state || "" },
    { name: "current_rating", label: "Current combined VA rating", placeholder: "90%", value: profile?.current_rating || "" },
    { name: "work_status", label: "Current work / SSDI status", placeholder: "Unemployed and on SSDI", value: profile?.work_status || "" },
    { name: "dependent_status", label: "Marital / dependent status", placeholder: "No spouse or dependents", value: profile?.dependent_status || "" },
  ];

  return (
    <form className="facts" action={upsertProfile}>
      {fields.map((field) => (
        <label key={field.name} className="factField">
          <span>{field.label}</span>
          <input name={field.name} placeholder={field.placeholder} defaultValue={field.value} />
        </label>
      ))}
      <button className="primaryButton" type="submit">Save profile</button>
    </form>
  );
}
