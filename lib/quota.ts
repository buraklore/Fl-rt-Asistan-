import { NextResponse } from "next/server";
import { isPremium } from "./auth";
import { createSupabaseServerClient } from "./supabase/server";

const FREE_TIER_DAILY: Record<string, number> = {
  message_generate: 3,
  chat: 5,
  conflict_analyze: 1,
  target_analyze: 2,
};

export type QuotaResult =
  | {
      ok: true;
      remaining: number | null;
      resetAt: Date;
      unlimited: boolean;
    }
  | { ok: false; response: NextResponse };

/**
 * Enforce the free-tier daily quota for a given feature.
 * Premium users bypass. Atomicity guaranteed by the `increment_usage` RPC
 * in the Supabase migration.
 */
export async function enforceQuota(
  userId: string,
  feature: keyof typeof FREE_TIER_DAILY,
): Promise<QuotaResult> {
  if (await isPremium(userId)) {
    return {
      ok: true,
      remaining: null,
      resetAt: nextMidnightUtc(),
      unlimited: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: newCount, error } = await supabase.rpc("increment_usage", {
    p_user_id: userId,
    p_feature: feature,
  });

  if (error) {
    // If the RPC isn't available, fail open rather than blocking the user.
    // Log it — likely indicates missing migration.
    console.error("Quota RPC failed:", error);
    return {
      ok: true,
      remaining: null,
      resetAt: nextMidnightUtc(),
      unlimited: false,
    };
  }

  const limit = FREE_TIER_DAILY[feature] ?? 0;
  const count = (newCount as number) ?? 1;

  if (count > limit) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          type: "https://flortasistani.app/errors/quota-exceeded",
          title: "Günlük Limit Doldu",
          status: 402,
          detail: "Ücretsiz katman günlük limiti doldu.",
          feature,
          limit,
          resetAt: nextMidnightUtc(),
          upgrade_url: "/pricing",
        },
        { status: 402 },
      ),
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - count),
    resetAt: nextMidnightUtc(),
    unlimited: false,
  };
}

function nextMidnightUtc(): Date {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d;
}
