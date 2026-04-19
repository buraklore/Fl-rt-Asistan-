import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "./supabase/server";

/**
 * Assert a user is logged in and return their record.
 * Returns a 401 NextResponse if not — callers should `return` it.
 *
 * Usage in a route handler:
 *   const authed = await requireUser();
 *   if (authed instanceof NextResponse) return authed;
 *   const { user, supabase } = authed;
 */
export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        type: "https://rizzai.app/errors/unauthorized",
        title: "Yetkisiz",
        status: 401,
        detail: "Giriş yapman gerekiyor.",
      },
      { status: 401 },
    );
  }

  return { user, supabase };
}

/**
 * Check whether the user has an active premium subscription.
 * Returns true/false; never throws.
 */
export async function isPremium(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.status === "active";
}
