import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client. Uses the anon key but runs on the server,
 * with the user's session attached via cookies. RLS policies apply.
 *
 * Use this in Server Components, Route Handlers, and Server Actions.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — can't set cookies there.
            // Middleware refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Service-role client — bypasses RLS. Use ONLY for:
 *   - Stripe webhooks
 *   - Daily hook cron
 *   - Admin ops
 * Never expose to browser. Never pass user input to queries without
 * explicit ownership checks in your code.
 */
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
