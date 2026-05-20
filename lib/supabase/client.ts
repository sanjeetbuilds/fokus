"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Read sessions and call auth methods from
 * Client Components via this. Server-side reads must go through
 * `lib/supabase/server.ts` so cookies are honoured.
 *
 * The anon key is safe to ship in the client bundle (Supabase ships it
 * by design). RLS is what protects rows.
 */
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
