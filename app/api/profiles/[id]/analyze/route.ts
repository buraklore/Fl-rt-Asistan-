import { NextRequest } from "next/server";
import {
  getLLM,
  buildAnalyzerSystemPrompt,
  buildAnalyzerUserMessage,
} from "@/lib/ai";
import {
  AnalyzeTargetLLMResponseSchema,
  type AnalyzeTargetLLMResponse,
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

  try {
    const provider = getLLM();

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
      temperature: 0.3,
      maxTokens: 2500,
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
        : "AI sağlayıcısı beklenmedik bir cevap verdi.";
    return fail(502, "AI Sağlayıcı Hatası", msg);
  }
}
