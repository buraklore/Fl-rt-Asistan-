import { NextRequest } from "next/server";
import {
  AnthropicProvider,
  buildScorerSystemPrompt,
} from "@/lib/ai";
import {
  RelationshipScoreLLMResponseSchema,
  type RelationshipScoreLLMResponse,
  type TargetProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ targetId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { targetId } = await params;

  const { data, error } = await supabase
    .from("relationship_scores")
    .select("*")
    .eq("target_id", targetId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return fail(500, "Database Error", error.message);
  return ok(data ?? null);
}

export async function POST(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;
  const { targetId } = await params;

  const { data: target } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", targetId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!target) return fail(404, "Not Found", "Hedef bulunamadı.");

  // Activity signals
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [{ count: gens }, { count: conflicts }] = await Promise.all([
    supabase
      .from("message_generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("target_id", targetId)
      .gte("created_at", weekAgo),
    supabase
      .from("conflict_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("target_id", targetId)
      .gte("created_at", monthAgo),
  ]);

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

  const provider = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    defaultModel: process.env.LLM_PRIMARY_MODEL,
  });

  const result = await provider.complete<RelationshipScoreLLMResponse>({
    system: buildScorerSystemPrompt({
      target: targetForPrompt,
      recentActivity: {
        generationsLast7Days: gens ?? 0,
        conflictsLast30Days: conflicts ?? 0,
        averageResponseLagHours: null,
      },
    }),
    messages: [{ role: "user", content: "Compute the score." }],
    schema: RelationshipScoreLLMResponseSchema,
    temperature: 0.3,
    maxTokens: 600,
  });

  const { data: saved, error } = await supabase
    .from("relationship_scores")
    .insert({
      target_id: targetId,
      compatibility: result.data.compatibility,
      risks: result.data.risks,
      strengths: result.data.strengths,
      summary: result.data.summary,
    })
    .select()
    .single();

  if (error) return fail(500, "Database Error", error.message);
  return ok(saved);
}
