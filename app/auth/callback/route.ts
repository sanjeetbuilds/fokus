import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Magic-link callback. Supabase emails a URL of the form
 *   /auth/callback?code=<code>&next=<optional-path>
 * exchanging the code for a session sets the session cookie via the
 * server client, then we redirect onward.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", url));
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[/auth/callback] exchange:", error.message);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url),
    );
  }

  return NextResponse.redirect(new URL(next, url));
}
