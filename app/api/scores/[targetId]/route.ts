import { NextRequest } from "next/server";
import {
  getLLM,
  buildScorerSystemPrompt,
} from "@/lib/ai";
import {
  RelationshipScoreLLMResponseSchema,
  type RelationshipScoreLLMResponse,
  type TargetProfileForPrompt,
  type UserProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { requireCompleteProfile } from "@/lib/profile-gate";
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

  if (error) return fail(500, "Veritabanı Hatası", error.message);
  return ok(data ?? null);
}

/**
 * DELETE /api/scores/[targetId]
 * Bu hedefin tüm skor geçmişini siler. Sonra yeni recompute temiz başlar.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { targetId } = await params;

  const { error } = await supabase
    .from("relationship_scores")
    .delete()
    .eq("target_id", targetId);

  if (error) return fail(500, "Silme Başarısız", error.message);
  return ok({ deleted: true });
}

export async function POST(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  // Profile gate — AI only runs with complete user profile
  const profileCheck = await requireCompleteProfile(user.id);
  if (!profileCheck.complete) {
    return fail(
      412,
      "Profil Tamamlanmamış",
      `Skor hesaplamak için önce profilini tamamla. Eksikler: ${profileCheck.missingFields.join(", ")}`,
      { missingFields: profileCheck.missingFields },
    );
  }

  const { targetId } = await params;

  const { data: target } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", targetId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!target) return fail(404, "Bulunamadı", "Hedef bulunamadı.");

  // Load the user's own profile for two-sided scoring
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select(
      "display_name, gender, age_range, interests, communication_style, attachment_style, relationship_goal, raw_bio, own_dynamic_style, own_expression_style, own_relationship_energy, attracted_to_dynamic_styles, attracted_to_expression_styles, attracted_to_energies",
    )
    .eq("id", user.id)
    .maybeSingle();

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
    dynamicStyle: target.dynamic_style ?? null,
    expressionStyle: target.expression_style ?? null,
    relationshipEnergy: target.relationship_energy ?? null,
  };

  const userForPrompt: UserProfileForPrompt | null = userProfile
    ? {
        displayName: userProfile.display_name ?? null,
        gender: userProfile.gender ?? null,
        ageRange: userProfile.age_range ?? null,
        interests: userProfile.interests ?? [],
        communicationStyle: userProfile.communication_style ?? null,
        attachmentStyle: userProfile.attachment_style ?? null,
        relationshipGoal: userProfile.relationship_goal ?? null,
        rawBio: userProfile.raw_bio ?? null,
        ownDynamicStyle: userProfile.own_dynamic_style ?? null,
        ownExpressionStyle: userProfile.own_expression_style ?? null,
        ownRelationshipEnergy: userProfile.own_relationship_energy ?? null,
        attractedToDynamicStyles: userProfile.attracted_to_dynamic_styles ?? [],
        attractedToExpressionStyles: userProfile.attracted_to_expression_styles ?? [],
        attractedToEnergies: userProfile.attracted_to_energies ?? [],
      }
    : null;

  try {
    const provider = getLLM();

    const result = await provider.complete<RelationshipScoreLLMResponse>({
      system: buildScorerSystemPrompt({
        user: userForPrompt,
        target: targetForPrompt,
        recentActivity: {
          generationsLast7Days: gens ?? 0,
          conflictsLast30Days: conflicts ?? 0,
          averageResponseLagHours: null,
        },
      }),
      messages: [{ role: "user", content: "Skoru hesapla." }],
      schema: RelationshipScoreLLMResponseSchema,
      temperature: 0.2,
      maxTokens: 2500,
    });

    const { data: saved, error } = await supabase
      .from("relationship_scores")
      .insert({
        target_id: targetId,
        compatibility: result.data.compatibility,
        risks: result.data.risks,
        strengths: result.data.strengths,
        summary: result.data.summary,
        confidence: result.data.confidence,
      })
      .select()
      .single();

    if (error) return fail(500, "Veritabanı Hatası", error.message);
    return ok({ ...saved, confidence: result.data.confidence });
  } catch (err) {
    console.error("[scores] failed:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Analiz servisi beklenmedik bir cevap verdi.";
    return fail(502, "Analiz Servisi Hatası", msg);
  }
}
