import { saveVoiceNote } from "@/app/actions";

export function VoiceNoteForm() {
  return (
    <form className="noteForm" action={saveVoiceNote}>
      <select name="topic" defaultValue="Personal statement timeline">
        <option value="Personal statement timeline">Personal statement timeline</option>
        <option value="What changed since last rating">What changed since last rating</option>
        <option value="Surgery and residual timeline">Surgery and residual timeline</option>
        <option value="Work impact / SSDI context">Work impact / SSDI context</option>
        <option value="Questions for VSO">Questions for VSO</option>
      </select>
      <textarea name="transcript" placeholder="Paste browser voice transcription or type the note here." />
      <button className="primaryButton" type="submit">Save note</button>
    </form>
  );
}
