"use client";

import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "apple";

async function signIn(provider: Provider) {
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`
    }
  });
}

export function AuthButtons() {
  return (
    <div className="authButtons">
      <button type="button" onClick={() => signIn("apple")}>
        Continue with Apple
      </button>
      <button type="button" className="google" onClick={() => signIn("google")}>
        Continue with Google
      </button>
    </div>
  );
}
