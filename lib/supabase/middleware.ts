import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh the Supabase session cookie on every request that passes
 * through the root middleware. Without this, sessions silently expire
 * mid-flow and Server Components see an unauthenticated user even
 * though the browser has a valid token.
 *
 * Returns the NextResponse Supabase mutated so the root middleware can
 * forward cookies correctly.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Reading the user triggers Supabase to refresh the token if needed
  // and (via setAll above) rewrites the response cookies.
  await supabase.auth.getUser();

  return response;
}
