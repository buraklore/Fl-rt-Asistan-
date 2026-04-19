import { NextRequest } from "next/server";
import {
  AnthropicProvider,
  MessageGeneratorService,
} from "@/lib/ai";
import {
  GenerateMessageRequestSchema,
  type TargetProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
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

  // 2. Validate body
  const body = await parseBody(request, GenerateMessageRequestSchema);
  if (body instanceof Response) return body;

  // 3. Quota check
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
      };
    }
  }

  // 5. Generate
  const provider = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    defaultModel: process.env.LLM_PRIMARY_MODEL,
  });
  const generator = new MessageGeneratorService(provider);

  const result = await generator.run({
    incomingMessage: body.incomingMessage,
    tones: body.tones ?? ["cool", "flirty", "confident"],
    target,
    userNote: body.context ?? null,
  });

  if (!result.ok) {
    // Log moderation event (bypass RLS via service client for audit)
    await supabase.from("moderation_logs").insert({
      user_id: user.id,
      input: body.incomingMessage,
      verdict: "hard_block",
      reasons: result.reasons,
    });
    return fail(403, "Moderation Blocked", result.message, {
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
    },
    {
      usage: quota.unlimited
        ? { unlimited: true }
        : { remaining: quota.remaining, resetAt: quota.resetAt },
    },
  );
}
