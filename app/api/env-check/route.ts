import { NextResponse } from "next/server";

/**
 * Runtime env probe. Returns presence booleans for the Supabase env
 * vars plus a short prefix of the URL so you can confirm it's pointing
 * at the right project. The actual values are not leaked; anon key is
 * already public, but we still don't echo it for log hygiene.
 *
 * Usage:
 *   curl https://your-app.vercel.app/api/env-check
 *
 * Expected when healthy:
 *   { "supabase_url": true, "supabase_key": true,
 *     "url_prefix": "https://kjnlaogflncnaigy", "node_env": "production" }
 */
export async function GET() {
  return NextResponse.json({
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 32) ?? null,
    node_env: process.env.NODE_ENV ?? null,
  });
}
