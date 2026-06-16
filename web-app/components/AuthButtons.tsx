"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthButtons() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithProvider(provider: "google" | "apple") {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
    }
  }

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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          app_name: "Veteran Journey Navigator",
          purpose: "private veteran benefits workspace sign-in"
        }
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
        <p>We sent a secure <strong>Veteran Journey Navigator</strong> sign-in link to <strong>{email}</strong>.</p>
        <p className="muted">Look for an email titled “Veteran Journey Navigator secure sign-in link.” It may take a minute, and it can land in spam or promotions.</p>
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
      <div className="oauthStack" aria-label="Social sign-in options">
        <button
          type="button"
          className="oauthButton"
          onClick={() => signInWithProvider("google")}
          disabled={loading}
        >
          <span className="oauthMark" aria-hidden="true">G</span>
          Continue with Google
        </button>
        <button
          type="button"
          className="oauthButton"
          onClick={() => signInWithProvider("apple")}
          disabled={loading}
        >
          <span className="oauthMark appleMark" aria-hidden="true"></span>
          Continue with Apple
        </button>
      </div>

      <div className="authDivider"><span>or use email</span></div>

      <label htmlFor="magic-email" className="magicLabel">
        Register or sign in with your email address
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
        {loading ? "Sending…" : "Email me a secure sign-in link"}
      </button>
      <p className="muted magicNote">
        No password needed. We'll send a secure Veteran Journey Navigator sign-in link.
      </p>
      <p className="muted" style={{ fontSize: 11, marginTop: 8, textAlign: "center", lineHeight: 1.5 }}>
        Your documents are stored privately and accessible only to your account.
        This is a personal research aid — not an official VA tool and not legal
        or benefits advice. Review all findings with an accredited VSO or
        claims attorney before taking action.
      </p>
    </div>
  );
}
