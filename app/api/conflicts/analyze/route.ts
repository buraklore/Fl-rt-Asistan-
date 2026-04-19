import { NextRequest } from "next/server";
import {
  getLLM,
  buildConflictSystemPrompt,
} from "@/lib/ai";
import {
  AnalyzeConflictRequestSchema,
  ConflictAnalysisLLMResponseSchema,
  type ConflictAnalysisLLMResponse,
  type TargetProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { enforceQuota } from "@/lib/quota";
import { fail, ok, parseBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  const body = await parseBody(request, AnalyzeConflictRequestSchema);
  if (body instanceof Response) return body;

  const quota = await enforceQuota(user.id, "conflict_analyze");
  if (!quota.ok) return quota.response;

  let target: TargetProfileForPrompt | null = null;
  if (body.targetId) {
    const { data: t } = await supabase
      .from("target_profiles")
      .select("*")
      .eq("id", body.targetId)
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
        analysis: null,
      };
    }
  }

  const provider = getLLM();

  const result = await provider.complete<ConflictAnalysisLLMResponse>({
    system: buildConflictSystemPrompt(target),
    messages: [
      { role: "user", content: `Chat transcript:\n"""\n${body.chatLog}\n"""` },
    ],
    schema: ConflictAnalysisLLMResponseSchema,
    temperature: 0.4,
    maxTokens: 1200,
  });

  const { data: saved, error } = await supabase
    .from("conflict_analyses")
    .insert({
      user_id: user.id,
      target_id: body.targetId ?? null,
      chat_log: body.chatLog,
      who_escalated: result.data.whoEscalated,
      emotions: result.data.emotions,
      root_cause: result.data.rootCause,
      fix_message: result.data.fixMessage,
      severity: result.data.severity,
    })
    .select()
    .single();

  if (error) return fail(500, "Database Error", error.message);
  return ok(saved);
}
