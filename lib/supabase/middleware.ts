import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh the Supabase session cookie on every request.
 *
 * Defensive on purpose: this runs for every page load, so if env vars
 * are missing at runtime (Vercel build inlined them before the user
 * added them, etc) or @supabase/ssr throws for any reason, we log it
 * and let the request pass through unchanged. The page-level AuthGate
 * will then redirect to /sign-in. The alternative — letting the
 * middleware throw — surfaces as "middleware invocation failed" and
 * 500s every route in the app.
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(
      "[supabase middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing at runtime. " +
        "Skipping session refresh. Confirm the env vars are set in the current Vercel build " +
        "(GET /api/env-check returns booleans for both).",
    );
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Reading the user triggers Supabase to refresh the token if needed
    // and (via setAll above) rewrites the response cookies.
    await supabase.auth.getUser();
  } catch (err) {
    console.error("[supabase middleware] session refresh failed:", err);
  }

  return response;
}
