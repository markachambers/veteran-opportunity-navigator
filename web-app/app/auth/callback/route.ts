import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error") || "";
  const providerErrorDescription = searchParams.get("error_description") || "";
  const next = searchParams.get("next") || "/";

  if (providerError) {
    const reason = providerErrorDescription || providerError;
    return NextResponse.redirect(`${origin}/?auth=error&reason=${encodeURIComponent(reason.slice(0, 160))}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
    }
    return NextResponse.redirect(`${origin}/?auth=error&reason=${encodeURIComponent(error.message.slice(0, 160))}`);
  }

  return NextResponse.redirect(`${origin}/?auth=error&reason=${encodeURIComponent("Missing sign-in code")}`);
}
