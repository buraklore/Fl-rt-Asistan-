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
  type UserProfileForPrompt,
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

  // Load user's own profile so fix-message is written in their voice
  const { data: userRow } = await supabase
    .from("user_profiles")
    .select(
      "display_name, gender, age_range, interests, communication_style, attachment_style, relationship_goal, raw_bio",
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
      }
    : null;

  try {
    const provider = getLLM();

    const result = await provider.complete<ConflictAnalysisLLMResponse>({
      system: buildConflictSystemPrompt({ user: userForPrompt, target }),
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
  } catch (err) {
    console.error("[conflicts] failed:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "AI sağlayıcısı beklenmedik bir cevap verdi.";
    return fail(502, "AI Provider Error", msg);
  }
}
