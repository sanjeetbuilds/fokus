import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Magic-link callback.
 *
 *   /auth/callback?code=<code>
 *
 * Exchange the code for a session, then route the user to /today
 * (existing child) or /onboarding (no child yet). On any failure,
 * bounce back to /sign-in with an error code.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    console.error("[/auth/callback] no code");
    return NextResponse.redirect(`${origin}/sign-in?error=no_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[/auth/callback] exchange:", error.message);
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/sign-in?error=no_user`);
  }

  const { data: child } = await supabase
    .from("child")
    .select("id")
    .eq("parent_id", user.id)
    .maybeSingle();

  return NextResponse.redirect(`${origin}${child ? "/today" : "/onboarding"}`);
}
