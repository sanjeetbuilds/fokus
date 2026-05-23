import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/welcome", "/sign-in", "/auth"];

const PROTECTED_ROUTES = [
  "/today",
  "/library",
  "/track",
  "/profile",
  "/onboarding",
  "/activity",
  "/done",
  "/map",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing at runtime. " +
        "GET /api/env-check to confirm; redeploy with cache disabled if the env vars were set after the last build.",
    );
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // /auth/callback runs exchangeCodeForSession; never intercept it.
  if (pathname.startsWith("/auth/callback")) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    pathname === "/" || AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) =>
    pathname.startsWith(r),
  );

  if (user) {
    if (isAuthRoute) {
      const { data: child } = await supabase
        .from("child")
        .select("id")
        .eq("parent_id", user.id)
        .maybeSingle();

      const target = child ? "/today" : "/onboarding";
      if (!pathname.startsWith(target)) {
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
  } else {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static / PWA / image assets.
     * /api and /dev pass through (middleware no-ops for them since
     * they match neither AUTH_ROUTES nor PROTECTED_ROUTES).
     */
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|icons|sw\\.js|workbox-.*\\.js|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
