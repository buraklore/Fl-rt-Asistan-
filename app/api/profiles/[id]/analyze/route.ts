import { NextRequest } from "next/server";
import {
  getLLM,
  buildAnalyzerSystemPrompt,
  buildAnalyzerUserMessage,
} from "@/lib/ai";
import {
  AnalyzeTargetLLMResponseSchema,
  type AnalyzeTargetLLMResponse,
  type UserProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { requireCompleteProfile } from "@/lib/profile-gate";
import { enforceQuota } from "@/lib/quota";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  const profileCheck = await requireCompleteProfile(user.id);
  if (!profileCheck.complete) {
    return fail(
      412,
      "Profil Tamamlanmamış",
      `Hedef analizi için önce profilini tamamla. Eksikler: ${profileCheck.missingFields.join(", ")}`,
      { missingFields: profileCheck.missingFields },
    );
  }

  const { id } = await params;

  const quota = await enforceQuota(user.id, "target_analyze");
  if (!quota.ok) return quota.response;

  const { data: target, error: loadErr } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (loadErr) return fail(500, "Veritabanı Hatası", loadErr.message);
  if (!target) return fail(404, "Bulunamadı", "Hedef bulunamadı.");

  // Load user profile so coaching advice is personalized
  const { data: userRow } = await supabase
    .from("user_profiles")
    .select(
      "display_name, gender, age_range, interests, communication_style, attachment_style, relationship_goal, raw_bio, own_dynamic_style, own_expression_style, own_relationship_energy, attracted_to_dynamic_styles, attracted_to_expression_styles, attracted_to_energies",
    )
    .eq("id", user.id)
    .maybeSingle();

  const userForPrompt: UserProfileForPrompt | null = userRow
    ? {
        displayName: userRow.display_name ?? null,
        gender: userRow.gender ?? null,
        ageRange: userRow.age_range ?? null,
        interests: userRow.interests ?? [],
        communicationStyle: userRow.communication_style ?? null,
        attachmentStyle: userRow.attachment_style ?? null,
        relationshipGoal: userRow.relationship_goal ?? null,
        rawBio: userRow.raw_bio ?? null,
        ownDynamicStyle: userRow.own_dynamic_style ?? null,
        ownExpressionStyle: userRow.own_expression_style ?? null,
        ownRelationshipEnergy: userRow.own_relationship_energy ?? null,
        attractedToDynamicStyles: userRow.attracted_to_dynamic_styles ?? [],
        attractedToExpressionStyles: userRow.attracted_to_expression_styles ?? [],
        attractedToEnergies: userRow.attracted_to_energies ?? [],
      }
    : null;

  try {
    const provider = getLLM();

    const result = await provider.complete<AnalyzeTargetLLMResponse>({
      system: buildAnalyzerSystemPrompt({ user: userForPrompt }),
      messages: [
        {
          role: "user",
          content: buildAnalyzerUserMessage({
            relation: target.relation,
            gender: target.gender,
            ageRange: target.age_range,
            interests: target.interests ?? [],
            behaviors: target.behaviors ?? [],
            contextNotes: target.context_notes,
            dynamicStyle: target.dynamic_style,
            expressionStyle: target.expression_style,
            relationshipEnergy: target.relationship_energy,
          }),
        },
      ],
      schema: AnalyzeTargetLLMResponseSchema,
      temperature: 0.3,
      maxTokens: 3500, // bumped for coaching advice
    });

    const analysis = result.data;

    const { data: updated, error: updateErr } = await supabase
      .from("target_profiles")
      .update({
        personality_type: analysis.personalityType,
        big5: analysis.big5,
        attachment_style: analysis.attachmentStyle,
        communication_style: analysis.communicationStyle,
        attraction_triggers: analysis.attractionTriggers,
        analysis_confidence: analysis.confidence,
        confidence_detail: analysis.confidenceDetail,
        coaching_advice: analysis.coachingAdvice,
        analysis_version: (target.analysis_version ?? 0) + 1,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) return fail(500, "Veritabanı Hatası", updateErr.message);
    return ok({
      ...updated,
      confidence: analysis.confidenceDetail,
      rationale: analysis.rationale,
    });
  } catch (err) {
    console.error("[analyze] failed:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Analiz servisi beklenmedik bir cevap verdi.";
    return fail(502, "Analiz Servisi Hatası", msg);
  }
}
