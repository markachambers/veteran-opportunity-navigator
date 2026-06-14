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
  return (
    <form className="facts" action={upsertProfile}>
      <input name="display_name" placeholder="Display name" defaultValue={profile?.display_name || ""} />
      <input name="branch" placeholder="Branch" defaultValue={profile?.branch || ""} />
      <input name="state" placeholder="State" defaultValue={profile?.state || ""} />
      <input name="current_rating" placeholder="Current rating" defaultValue={profile?.current_rating || ""} />
      <input name="work_status" placeholder="Work status" defaultValue={profile?.work_status || ""} />
      <input name="dependent_status" placeholder="Dependents" defaultValue={profile?.dependent_status || ""} />
      <button className="primaryButton" type="submit">Save profile</button>
    </form>
  );
}
