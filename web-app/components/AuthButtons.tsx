"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthButtons() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMagicLink() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="magicSent">
        <div className="magicIcon">✉️</div>
        <h2>Check your email</h2>
        <p>We sent a sign-in link to <strong>{email}</strong>. Click it to access your workspace.</p>
        <p className="muted">No password needed. The link expires in 1 hour.</p>
        <button
          className="magicResend"
          onClick={() => { setSent(false); setEmail(""); }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="magicForm">
      <label htmlFor="magic-email" className="magicLabel">
        Your email address
      </label>
      <input
        id="magic-email"
        type="email"
        className="magicInput"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMagicLink()}
        disabled={loading}
        autoFocus
      />
      {error && <p className="magicError">{error}</p>}
      <button
        className="magicButton"
        onClick={sendMagicLink}
        disabled={loading}
      >
        {loading ? "Sending…" : "Send sign-in link"}
      </button>
      <p className="muted magicNote">
        No account needed. Enter your email and we'll send you a secure link.
      </p>
    </div>
  );
}
