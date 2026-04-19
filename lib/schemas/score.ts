import { z } from "zod";

const RiskSchema = z.object({
  label: z.string().min(3).max(80),
  severity: z.number().min(1).max(5),
  evidence: z
    .string()
    .min(20, "Her risk için somut kanıt zorunlu")
    .max(400),
});

const StrengthSchema = z.object({
  label: z.string().min(3).max(80),
  evidence: z
    .string()
    .min(20, "Her güç için somut kanıt zorunlu")
    .max(400),
});

/**
 * Honesty layer — AI rates its own output quality.
 * confidence < 0.6 → UI shows a yellow "low certainty" warning.
 * dataGaps → shown as "complete your profile / add more detail" nudge.
 */
const ConfidenceSchema = z.object({
  overall: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "0-1 arasında. 1 = tüm kanıtlar güçlü. 0 = çoğu iddia zayıf temelli.",
    ),
  dataGaps: z
    .array(z.string().min(5).max(200))
    .max(6)
    .describe(
      "Eksik veya belirsiz olduğu için analizi zayıflatan alanların Türkçe listesi.",
    ),
  explanation: z
    .string()
    .min(30, "Güven açıklaması en az bir cümle olmalı")
    .max(400)
    .describe(
      "Bu güven skorunun neden verildiğinin Türkçe açıklaması.",
    ),
});

export const RelationshipScoreLLMResponseSchema = z.object({
  compatibility: z.number().min(0).max(100),
  risks: z.array(RiskSchema).min(1).max(3),
  strengths: z.array(StrengthSchema).min(1).max(3),
  summary: z.string().min(30, "Özet en az bir cümle olmalı").max(400),
  confidence: ConfidenceSchema,
});
export type RelationshipScoreLLMResponse = z.infer<
  typeof RelationshipScoreLLMResponseSchema
>;
