import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RealityCheck = {
  shouldShow: true;
  targetId: string;
  targetName: string | null;
  generationCount: number;
  hoursSinceLastReply: number | null;
  message: string;
} | { shouldShow: false };

/**
 * Detects obsessive usage patterns and returns a soft nudge.
 *
 * Current heuristic: more than 15 message generations for a single target
 * in the past 48 hours, with no actual chat reply from the user (proxy for
 * "they aren't responding"). Real implementation would track actual sent-message
 * timestamps; at MVP we use generation volume as a proxy.
 *
 * Intentionally conservative — false positives here feel condescending, so we
 * only trigger when the pattern is unambiguous.
 */
export async function detectRealityCheck(
  userId: string,
): Promise<RealityCheck> {
  const supabase = await createSupabaseServerClient();

  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Count generations per target in the last 48h
  const { data: recentGens } = await supabase
    .from("message_generations")
    .select("target_id, created_at")
    .eq("user_id", userId)
    .gte("created_at", twoDaysAgo)
    .not("target_id", "is", null);

  if (!recentGens || recentGens.length === 0) {
    return { shouldShow: false };
  }

  // Bucket by target
  const bucketed = new Map<string, number>();
  for (const g of recentGens) {
    if (!g.target_id) continue;
    bucketed.set(g.target_id, (bucketed.get(g.target_id) ?? 0) + 1);
  }

  // Find the most-used target in this window
  let maxCount = 0;
  let maxTargetId: string | null = null;
  for (const [tid, count] of bucketed.entries()) {
    if (count > maxCount) {
      maxCount = count;
      maxTargetId = tid;
    }
  }

  // Threshold: 15+ generations on one target in 48h
  if (!maxTargetId || maxCount < 15) {
    return { shouldShow: false };
  }

  const { data: target } = await supabase
    .from("target_profiles")
    .select("id, name")
    .eq("id", maxTargetId)
    .maybeSingle();

  if (!target) return { shouldShow: false };

  const nameDisplay = target.name ? `${target.name} için` : "bir kişi için";

  return {
    shouldShow: true,
    targetId: target.id,
    targetName: target.name,
    generationCount: maxCount,
    hoursSinceLastReply: null,
    message: `Son 48 saatte ${nameDisplay} ${maxCount} farklı mesaj ürettin. Belki bir nefes almak iyi gelir — kendine zaman tanımak bazen en doğru cevap.`,
  };
}
