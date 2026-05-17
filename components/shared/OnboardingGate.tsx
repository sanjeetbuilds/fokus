"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { listChildren, getCurrentParent } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";

/**
 * Routes that don't require an onboarded parent + at least one child.
 * The /dev/* tools stay open so we can inspect state during development.
 */
const FIRST_RUN_ALLOWED = (path: string): boolean =>
  path === "/intro" ||
  path.startsWith("/onboarding") ||
  path.startsWith("/dev");

const CHILD_ONBOARDING_ALLOWED = (path: string): boolean =>
  path === "/onboarding/child" || path.startsWith("/dev");

/**
 * Client-side onboarding gate. Reads IndexedDB on mount, then:
 *   - no parent  → push to /intro (unless already inside the intro / onboarding flow)
 *   - parent but no children → push to /onboarding/child (same exception)
 *   - "/" (root) → push to /today if fully onboarded, /intro otherwise
 *
 * Renders children immediately while it checks — there's an unavoidable flash
 * on first paint because the gate can only run after hydration. That's
 * acceptable for Phase 1; a real fix would need the parent record to be
 * mirrored into a cookie (server-readable) at signup time.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setParent = useAppStore((s) => s.setParent);

  // Track whether we've kicked off a navigation so the next pathname change
  // doesn't immediately re-trigger the check before the new route mounts.
  const navigatingRef = useRef(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      navigatingRef.current = false;
      try {
        const parent = await getCurrentParent();
        if (cancelled) return;

        if (!parent) {
          if (!FIRST_RUN_ALLOWED(pathname)) {
            navigatingRef.current = true;
            router.replace("/intro");
          } else if (pathname === "/") {
            navigatingRef.current = true;
            router.replace("/intro");
          }
          setChecked(true);
          return;
        }

        // Mirror the DB parent id into the store so other client code can read
        // it without an async DB hit.
        setParent(parent.id);

        const kids = await listChildren(parent.id);
        if (cancelled) return;

        if (kids.length === 0) {
          if (!CHILD_ONBOARDING_ALLOWED(pathname)) {
            navigatingRef.current = true;
            router.replace("/onboarding/child");
          }
          setChecked(true);
          return;
        }

        // Fully onboarded. Bounce root → /today; otherwise allow the current path.
        if (pathname === "/") {
          navigatingRef.current = true;
          router.replace("/today");
        }
        setChecked(true);
      } catch (err) {
        console.error("[OnboardingGate] check failed:", err);
        if (!cancelled) setChecked(true);
      }
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, setParent]);

  // We render children regardless of `checked` — this avoids a layout-wide
  // blank screen. Pages that absolutely require an onboarded state should
  // re-check themselves before doing destructive things.
  return <>{children}</>;
}
