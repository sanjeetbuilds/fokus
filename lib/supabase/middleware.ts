import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Public paths that don't require a Supabase session.
 *
 *   /welcome          ; splash + intros (the unauthed entry)
 *   /sign-in          ; the magic-link form
 *   /auth/callback    ; the magic-link exchange handler (MUST run for
 *                       authed users too, so it's public but exempt
 *                       from the auth-aware redirect below)
 *   /auth/check-email ; "we sent you a link" surface
 *   /api/*            ; diagnostic + future server endpoints
 *   /dev/*            ; local dev tools
 */
function isPublic(pathname: string): boolean {
  return (
    pathname === "/welcome" ||
    pathname === "/sign-in" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/dev")
  );
}

/**
 * Auth-surface paths an already-authed user has no business sitting
 * on. When the middleware sees a live session here, it does a
 * server-side child lookup and redirects DIRECTLY to /today or
 * /onboarding so the user never bounces through "/" and the
 * client-side OnboardingGate.
 *
 * Notably excludes /auth/callback (that route's whole job is to run
 * exchangeCodeForSession; the user is mid-auth there) and /api / /dev.
 */
function isAuthSurface(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/welcome" ||
    pathname === "/sign-in" ||
    pathname === "/auth/check-email"
  );
}

/**
 * Supabase + Next.js middleware. Refreshes the session cookie on
 * every request, then:
 *
 *   no session  + protected path    →  /welcome
 *   session     + /auth-surface     →  /today (child) or /onboarding
 *   anything else                   →  pass through
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[supabase middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing at runtime. " +
        "GET /api/env-check to confirm; redeploy with cache disabled if the env vars were set after the last build.",
    );
    if (!isPublic(pathname)) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/welcome";
      return NextResponse.redirect(redirect);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // IMPORTANT: getUser MUST run before any redirect we return, so
    // the cookie refresh from setAll lands on the response we send.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Unauthed user touching a protected path; bounce to /welcome.
    if (!user && !isPublic(pathname)) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/welcome";
      return NextResponse.redirect(redirect);
    }

    // Authed user landing on an auth surface (/, /welcome, /sign-in,
    // /auth/check-email). Do the child lookup here and redirect
    // straight to the final destination so the user never bounces
    // through "/" while the client-side gate boots.
    if (user && isAuthSurface(pathname)) {
      const { data: child } = await supabase
        .from("child")
        .select("id")
        .eq("parent_id", user.id)
        .maybeSingle();

      const redirect = request.nextUrl.clone();
      redirect.pathname = child ? "/today" : "/onboarding";
      return NextResponse.redirect(redirect);
    }

    return supabaseResponse;
  } catch (err) {
    // Fail closed: any error in the session-refresh path on a
    // protected route bounces to /welcome with an error code. We
    // don't trap users on auth surfaces.
    console.error(
      "[supabase middleware] session refresh threw:",
      err instanceof Error ? `${err.name}: ${err.message}\n${err.stack}` : err,
    );
    if (!isPublic(pathname)) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/welcome";
      redirect.searchParams.set("error", "session_refresh_failed");
      return NextResponse.redirect(redirect);
    }
    return NextResponse.next({ request });
  }
}
