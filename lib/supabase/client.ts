"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton-per-render browser Supabase client. Do not memoize across
 * tabs or sessions — @supabase/ssr handles that internally via cookies.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
