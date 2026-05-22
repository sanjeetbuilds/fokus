import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Public paths that don't require a Supabase session.
 *
 *   /welcome         ; splash + intro + final CTA, the unauthed entry point
 *   /sign-in         ; the magic-link form itself
 *   /auth/*          ; the magic-link callback
 *   /api/*           ; diagnostic + future server endpoints
 *   /dev/*           ; local dev tools
 *
 * Everything else (including /intro and /onboarding) requires auth.
 * Static assets are already excluded by the root middleware matcher.
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
 * Canonical Supabase + Next.js middleware: refresh the session cookie
 * on every request, then redirect based on auth state.
 *
 *   no session + non-public path  →  /welcome
 *   session     + /sign-in        →  /
 *   session     + /welcome        →  /
 *   anything else                 →  pass through
 *
 * Env-var presence is checked up-front: if the build is missing the
 * Supabase URL/anon key the middleware logs a single descriptive line
 * and falls back to "allow only the obviously-public paths". This
 * mirrors what would happen if Supabase itself was down: better to
 * keep /sign-in and /api/env-check reachable than to 500 the whole
 * site, while still refusing to let unauthenticated requests through
 * to gated routes.
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

    if (!user && !isPublic(pathname)) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/welcome";
      return NextResponse.redirect(redirect);
    }

    if (user && (pathname === "/sign-in" || pathname === "/welcome")) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/";
      return NextResponse.redirect(redirect);
    }

    return supabaseResponse;
  } catch (err) {
    // The previous "pass through on any error" was a bypass: it let
    // unauthed users reach gated routes. Now we fail closed; log the
    // root cause and redirect to /welcome for any non-public path so
    // a transient Supabase failure can't punch a hole in auth.
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
