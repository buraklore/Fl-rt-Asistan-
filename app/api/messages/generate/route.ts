import { NextRequest } from "next/server";
import {
  getLLM,
  MessageGeneratorService,
} from "@/lib/ai";
import {
  GenerateMessageRequestSchema,
  type TargetProfileForPrompt,
  type UserProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { requireCompleteProfile } from "@/lib/profile-gate";
import { enforceQuota } from "@/lib/quota";
import { fail, ok, parseBody } from "@/lib/http";

// Running on the Node runtime (not edge) because the Anthropic SDK + Supabase
// server client are Node-first.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Auth
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  // 2. Profile gate — AI only runs with complete user profile
  const profileCheck = await requireCompleteProfile(user.id);
  if (!profileCheck.complete) {
    return fail(
      412,
      "Profil Tamamlanmamış",
      `AI analizi için önce profilini tamamla. Eksikler: ${profileCheck.missingFields.join(", ")}`,
      { missingFields: profileCheck.missingFields },
    );
  }

  // 3. Validate body
  const body = await parseBody(request, GenerateMessageRequestSchema);
  if (body instanceof Response) return body;

  // 4. Quota check
  const quota = await enforceQuota(user.id, "message_generate");
  if (!quota.ok) return quota.response;

  // 4. Load target profile if provided
  let target: TargetProfileForPrompt | null = null;
  if (body.targetId) {
    const { data: t } = await supabase
      .from("target_profiles")
      .select("*")
      .eq("id", body.targetId)
      .is("deleted_at", null)
      .maybeSingle();
    if (t) {
      target = {
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
    }
  }

  // 4b. Load user's own profile for voice calibration
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

  // 5. Generate
  const provider = getLLM();
  const generator = new MessageGeneratorService(provider);

  let result;
  try {
    result = await generator.run({
      incomingMessage: body.incomingMessage,
      tones: body.tones ?? ["cool", "flirty", "confident"],
      user: userForPrompt,
      target,
      userNote: body.context ?? null,
    });
  } catch (err) {
    console.error("[generate] failed:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "AI sağlayıcısı beklenmedik bir cevap verdi.";
    return fail(502, "AI Sağlayıcı Hatası", msg);
  }

  if (!result.ok) {
    // Log moderation event (bypass RLS via service client for audit)
    await supabase.from("moderation_logs").insert({
      user_id: user.id,
      input: body.incomingMessage,
      verdict: "hard_block",
      reasons: result.reasons,
    });
    return fail(403, "Güvenlik Kontrolü", result.message, {
      reasons: result.reasons,
    });
  }

  // 6. Persist generation
  const { data: saved, error: saveError } = await supabase
    .from("message_generations")
    .insert({
      user_id: user.id,
      target_id: body.targetId ?? null,
      incoming_message: body.incomingMessage,
      context_note: body.context ?? null,
      tones_requested: body.tones,
      replies: result.replies,
      model: result.telemetry.model,
      prompt_version: result.telemetry.promptVersion,
      latency_ms: result.telemetry.latencyMs,
      input_tokens: result.telemetry.inputTokens,
      output_tokens: result.telemetry.outputTokens,
    })
    .select("id")
    .single();

  if (saveError) {
    console.error("Failed to persist generation:", saveError);
  }

  return ok(
    {
      generationId: saved?.id ?? null,
      replies: result.replies,
      confidence: result.confidence,
    },
    {
      usage: quota.unlimited
        ? { unlimited: true }
        : { remaining: quota.remaining, resetAt: quota.resetAt },
    },
  );
}
