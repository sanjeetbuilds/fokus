import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Magic-link callback.
 *
 *   /auth/callback?code=<code>
 *
 * 1. Exchange the code for a session (sets the session cookie).
 * 2. Look up the signed-in parent's child row.
 * 3. Existing parent (has child)  -> /today
 *    New parent      (no child)   -> /onboarding
 * 4. On any error in steps 1 or 2, fall back to /sign-in with an
 *    error code so the user can retry.
 *
 * Doing this here (rather than redirecting to / and letting the
 * client-side OnboardingGate sort it out) eliminates the brief
 * flash of "/" between the cookie being set and the gate running.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", url));
  }

  const supabase = await getSupabaseServer();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("[/auth/callback] exchange:", exchangeError.message);
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${encodeURIComponent(exchangeError.message)}`,
        url,
      ),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Exchange succeeded but no user came back; treat as soft auth
    // failure and bounce back to sign-in.
    console.error("[/auth/callback] no user after exchange");
    return NextResponse.redirect(
      new URL("/sign-in?error=no_user", url),
    );
  }

  const { data: child, error: childError } = await supabase
    .from("child")
    .select("id")
    .eq("parent_id", user.id)
    .maybeSingle();
  if (childError) {
    console.error("[/auth/callback] child lookup:", childError.message);
    // Don't trap the user; send them to onboarding and let it 409
    // gracefully if a row already exists.
    return NextResponse.redirect(new URL("/onboarding", url));
  }

  return NextResponse.redirect(
    new URL(child ? "/today" : "/onboarding", url),
  );
}
