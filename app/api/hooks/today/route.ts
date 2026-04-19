import {
  getLLM,
  buildHooksSystemPrompt,
} from "@/lib/ai";
import {
  HookLLMResponseSchema,
  type HookLLMResponse,
  type TargetProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  // Return today's delivery if we already made one
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data: existing } = await supabase
    .from("hook_deliveries")
    .select("*, target:target_profiles(name)")
    .eq("user_id", user.id)
    .gte("delivered_at", startOfDay.toISOString())
    .order("delivered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return ok({
      id: existing.id,
      category: existing.category,
      text: existing.rendered_text,
      targetId: existing.target_id,
      targetName: (existing.target as { name?: string } | null)?.name ?? null,
      deliveredAt: existing.delivered_at,
    });
  }

  // Pick the most neglected target (oldest updated_at)
  const { data: target } = await supabase
    .from("target_profiles")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!target) return ok(null);

  const { data: last } = await supabase
    .from("message_generations")
    .select("created_at")
    .eq("user_id", user.id)
    .eq("target_id", target.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const daysSince = last
    ? Math.floor(
        (Date.now() - new Date(last.created_at).getTime()) / 86_400_000,
      )
    : null;

  const targetForPrompt: TargetProfileForPrompt = {
    name: target.name,
    relation: (target.relation as "crush" | "partner" | "ex" | "match" | "friend") ?? "crush",
    gender: target.gender,
    ageRange: target.age_range,
    interests: target.interests ?? [],
    behaviors: target.behaviors ?? [],
    contextNotes: target.context_notes,
    analysis: null,
  };

  const provider = getLLM();

  const result = await provider.complete<HookLLMResponse>({
    system: buildHooksSystemPrompt({
      target: targetForPrompt,
      daysSinceLastContact: daysSince,
      recentHookCategories: [],
    }),
    messages: [{ role: "user", content: "Generate today's hook." }],
    schema: HookLLMResponseSchema,
    temperature: 0.8,
    maxTokens: 300,
  });

  const { data: saved, error } = await supabase
    .from("hook_deliveries")
    .insert({
      user_id: user.id,
      target_id: target.id,
      category: result.data.category,
      rendered_text: result.data.text,
    })
    .select()
    .single();

  if (error) return fail(500, "Database Error", error.message);
  return ok({
    id: saved.id,
    category: saved.category,
    text: saved.rendered_text,
    targetId: saved.target_id,
    targetName: target.name,
    deliveredAt: saved.delivered_at,
  });
}
