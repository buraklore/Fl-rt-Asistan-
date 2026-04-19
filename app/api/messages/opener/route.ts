import { NextRequest } from "next/server";
import {
  getLLM,
  buildOpenerSystemPrompt,
  buildOpenerUserMessage,
  OPENER_PROMPT_VERSION,
} from "@/lib/ai";
import {
  GenerateOpenerRequestSchema,
  GenerateOpenerLLMResponseSchema,
  type GenerateOpenerLLMResponse,
  type TargetProfileForPrompt,
  type UserProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { requireCompleteProfile } from "@/lib/profile-gate";
import { enforceQuota } from "@/lib/quota";
import { fail, ok, parseBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  const profileCheck = await requireCompleteProfile(user.id);
  if (!profileCheck.complete) {
    return fail(
      412,
      "Profil Tamamlanmamış",
      `İlk mesaj üretmek için önce profilini tamamla. Eksikler: ${profileCheck.missingFields.join(", ")}`,
      { missingFields: profileCheck.missingFields },
    );
  }

  const body = await parseBody(request, GenerateOpenerRequestSchema);
  if (body instanceof Response) return body;

  // Aynı quota'yı paylaşıyor
  const quota = await enforceQuota(user.id, "message_generate");
  if (!quota.ok) return quota.response;

  // Hedef zorunlu
  const { data: t } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", body.targetId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!t) return fail(404, "Bulunamadı", "Seçilen hedef bulunamadı.");

  const target: TargetProfileForPrompt = {
    name: t.name,
    relation: (t.relation as "crush" | "partner" | "ex" | "match" | "friend") ?? "crush",
    gender: t.gender,
    ageRange: t.age_range,
    interests: t.interests ?? [],
    behaviors: t.behaviors ?? [],
    contextNotes: t.context_notes,
    analysis:
      t.personality_type && t.big5 && t.attachment_style && t.communication_style
        ? {
            personalityType: t.personality_type,
            big5: t.big5,
            attachmentStyle: t.attachment_style,
            communicationStyle: t.communication_style,
            attractionTriggers: t.attraction_triggers ?? [],
            confidence: t.analysis_confidence ?? 0.5,
          }
        : null,
    dynamicStyle: t.dynamic_style ?? null,
    expressionStyle: t.expression_style ?? null,
    relationshipEnergy: t.relationship_energy ?? null,
  };

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

    const result = await provider.complete<GenerateOpenerLLMResponse>({
      system: buildOpenerSystemPrompt({
        tones: body.tones ?? ["cool", "flirty", "confident"],
        user: userForPrompt,
        target,
        situation: body.situation ?? null,
      }),
      messages: [{ role: "user", content: buildOpenerUserMessage() }],
      schema: GenerateOpenerLLMResponseSchema,
      temperature: 0.8,
      maxTokens: 1500,
    });

    // Üretimi kaydet (aynı message_generations tablosunda "opener" mode ile)
    const { data: saved } = await supabase
      .from("message_generations")
      .insert({
        user_id: user.id,
        target_id: body.targetId,
        incoming_message: "[OPENER]", // marker, no incoming message
        context_note: body.situation ?? null,
        tones_requested: body.tones,
        replies: result.data.openers,
        model: result.model,
        prompt_version: OPENER_PROMPT_VERSION,
        latency_ms: result.latencyMs,
        input_tokens: result.usage.inputTokens,
        output_tokens: result.usage.outputTokens,
      })
      .select("id")
      .single();

    return ok(
      {
        generationId: saved?.id ?? null,
        openers: result.data.openers,
        confidence: result.data.confidence,
      },
      {
        usage: quota.unlimited
          ? { unlimited: true }
          : { remaining: quota.remaining, resetAt: quota.resetAt },
      },
    );
  } catch (err) {
    console.error("[opener] failed:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Analiz servisi beklenmedik bir cevap verdi.";
    return fail(502, "Analiz Servisi Hatası", msg);
  }
}
