"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Public routes that don't require a Supabase session. Everything else
 * redirects to /sign-in when no user is present.
 */
const PUBLIC_PATH = (path: string): boolean =>
  path === "/sign-in" ||
  path === "/intro" ||
  path.startsWith("/auth") ||
  path.startsWith("/dev");

/**
 * Client-side auth gate. Layered above OnboardingGate so the order is:
 *   AuthGate     → checks Supabase session  → /sign-in if missing
 *   OnboardingGate → checks child presence  → /onboarding if missing
 *   page         → renders
 *
 * Renders children immediately while it checks; there's an unavoidable
 * post-hydration flash because the session lookup is async. That's fine
 * for now (the server middleware already refreshed the cookie; the gate
 * is just confirming on the client).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowser();

    const run = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        const signedIn = !!data.session;

        if (!signedIn && !PUBLIC_PATH(pathname)) {
          router.replace("/sign-in");
        } else if (signedIn && pathname === "/sign-in") {
          router.replace("/");
        }
      } catch (err) {
        console.error("[AuthGate] getSession failed:", err);
      } finally {
        if (!cancelled) setChecked(true);
      }
    };

    void run();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/sign-in");
      } else if (event === "SIGNED_IN" && pathname === "/sign-in") {
        router.replace("/");
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [pathname, router]);

  return <>{children}</>;
}
