"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Sign out the current Supabase session. Returns the auth error (if any)
 * so the caller can show it; AuthGate's onAuthStateChange subscription
 * handles the redirect to /sign-in automatically.
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.auth.signOut();
  return { error: error ? new Error(error.message) : null };
}
