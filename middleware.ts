import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware: refreshes the Supabase session on every request so
 * Server Components and Route Handlers see a fresh user. Auth gating
 * (redirect when not signed in) is handled by AuthGate in the layout,
 * not here, so the splash and sign-in routes stay reachable.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static / _next/image (static assets)
     * - favicon, manifest, icons (PWA assets)
     * - sw.js / workbox-* (PWA service worker)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|sw\\.js|workbox-).*)",
  ],
};
