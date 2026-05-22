"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { getCurrentChild } from "@/lib/supabase/queries";

/**
 * Paths that are reachable WITHOUT a child row. Middleware has already
 * gated everything below this to require a Supabase session, so the
 * only branching this gate cares about is whether the parent has
 * onboarded their child yet.
 *
 *   /onboarding ; the form that creates the row
 *   /intro      ; the optional 3-slide explainer (no auto-redirect to
 *                  here anymore; left reachable for parents who want
 *                  to revisit it)
 *   /sign-in, /auth/*, /api/*, /dev/* ; middleware handles them, but
 *                  list here so the gate is a no-op if a request slips
 *                  through with a session
 */
function isNoChildAllowed(path: string): boolean {
  return (
    path.startsWith("/onboarding") ||
    path === "/intro" ||
    path === "/sign-in" ||
    path.startsWith("/auth") ||
    path.startsWith("/api") ||
    path.startsWith("/dev")
  );
}

/**
 * Onboarding gate. Runs only for signed-in users (middleware redirects
 * everyone else to /sign-in first).
 *
 *   no child row    + non-allowed path  →  /onboarding
 *   has child row   + on /onboarding    →  /today
 *   has child row   + on /              →  /today
 *
 * The Dexie-based version queried two tables (parent + children) with
 * a "first run" branch that pushed to /intro. With Supabase + auth,
 * the "parent" identity is the session (auth.uid()) so we only need
 * the child check.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const navigatingRef = useRef(false);
  const [, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      navigatingRef.current = false;
      try {
        const child = await getCurrentChild();
        if (cancelled) return;

        if (!child) {
          if (!isNoChildAllowed(pathname)) {
            navigatingRef.current = true;
            router.replace("/onboarding");
          }
          setChecked(true);
          return;
        }

        // Has child: bounce away from the onboarding form and from
        // the bare "/" root.
        if (pathname === "/onboarding" || pathname === "/") {
          navigatingRef.current = true;
          router.replace("/today");
        }
        setChecked(true);
      } catch (err) {
        console.error("[OnboardingGate] child lookup failed:", err);
        if (!cancelled) setChecked(true);
      }
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return <>{children}</>;
}
