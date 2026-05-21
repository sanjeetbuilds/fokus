"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * AuthGate is now a thin client-side helper: middleware enforces auth
 * on every request (lib/supabase/middleware.ts), so path-based
 * redirects don't belong here. All this component does is listen for
 * SIGNED_OUT events from supabase.auth and push the user back to
 * /sign-in so an explicit sign-out (or token revocation in another
 * tab) takes effect immediately instead of waiting for the next
 * navigation.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/sign-in");
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
