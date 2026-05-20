import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client for Route Handlers, Server Components, and
 * Server Actions. Reads + writes cookies via Next's request cookie
 * store. Pair with `middleware.ts` so session refresh stays in sync.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Calling `set` from a Server Component is a no-op; that's
            // fine when middleware is also refreshing the session.
          }
        },
      },
    },
  );
}
