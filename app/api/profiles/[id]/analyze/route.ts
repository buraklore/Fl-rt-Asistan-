import { NextRequest } from "next/server";
import {
  AnthropicProvider,
  buildAnalyzerSystemPrompt,
  buildAnalyzerUserMessage,
} from "@/lib/ai";
import {
  AnalyzeTargetLLMResponseSchema,
  type AnalyzeTargetLLMResponse,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { enforceQuota } from "@/lib/quota";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;
  const { id } = await params;

  const quota = await enforceQuota(user.id, "target_analyze");
  if (!quota.ok) return quota.response;

  const { data: target, error: loadErr } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (loadErr) return fail(500, "Database Error", loadErr.message);
  if (!target) return fail(404, "Not Found", "Hedef bulunamadı.");

  const provider = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    defaultModel: process.env.LLM_PRIMARY_MODEL,
  });

  const result = await provider.complete<AnalyzeTargetLLMResponse>({
    system: buildAnalyzerSystemPrompt(),
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
        }),
      },
    ],
    schema: AnalyzeTargetLLMResponseSchema,
    temperature: 0.5,
    maxTokens: 800,
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
      analysis_version: (target.analysis_version ?? 0) + 1,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) return fail(500, "Database Error", updateErr.message);
  return ok(updated);
}
