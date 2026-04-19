import { z } from "zod";

export const AnalyzeConflictRequestSchema = z.object({
  targetId: z.string().optional(),
  chatLog: z
    .string()
    .min(
      100,
      "Transkript çok kısa — doğru analiz için en az birkaç mesaj alışverişi lazım (100 karakter)",
    )
    .max(15_000, "Transkript çok uzun."),
  contextNote: z
    .string()
    .min(
      40,
      "Ne hakkında tartıştığınızı kısaca anlat — en az 40 karakter. Transkriptten dışarıda kalan bağlam önemli.",
    )
    .max(1000),
});
export type AnalyzeConflictRequest = z.infer<
  typeof AnalyzeConflictRequestSchema
>;

const EmotionSchema = z.object({
  label: z.string().min(3).max(60),
  intensity: z.number().min(1).max(5),
  evidence: z
    .string()
    .min(15, "Her duygu için transkriptten somut kanıt zorunlu")
    .max(400),
});

const ConfidenceSchema = z.object({
  overall: z.number().min(0).max(1),
  dataGaps: z.array(z.string().min(5).max(200)).max(6),
  explanation: z.string().min(30).max(400),
});

export const ConflictAnalysisLLMResponseSchema = z.object({
  whoEscalated: z.enum(["user", "target", "both", "neither"]),
  emotions: z.object({
    user: z.array(EmotionSchema).min(1).max(5),
    target: z.array(EmotionSchema).min(1).max(5),
  }),
  rootCause: z.string().min(30, "Kök sebep en az bir tam cümle olmalı").max(400),
  severity: z.number().min(1).max(5),
  fixMessage: z.string().min(15).max(800),
  fixRationale: z
    .string()
    .min(30, "Onarım açıklaması en az bir cümle olmalı")
    .max(400),
  confidence: ConfidenceSchema,
});
export type ConflictAnalysisLLMResponse = z.infer<
  typeof ConflictAnalysisLLMResponseSchema
>;
