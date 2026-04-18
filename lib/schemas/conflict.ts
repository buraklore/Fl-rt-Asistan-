import { z } from "zod";

export const AnalyzeConflictRequestSchema = z.object({
  targetId: z.string().optional(),
  chatLog: z
    .string()
    .min(20, "Transkript çok kısa — en az birkaç satır paylaş.")
    .max(15_000, "Transkript çok uzun."),
});
export type AnalyzeConflictRequest = z.infer<
  typeof AnalyzeConflictRequestSchema
>;

const EmotionSchema = z.object({
  label: z.string().max(40),
  intensity: z.number().min(1).max(5),
  evidence: z.string().max(300),
});

export const ConflictAnalysisLLMResponseSchema = z.object({
  whoEscalated: z.enum(["user", "target", "both", "neither"]),
  emotions: z.object({
    user: z.array(EmotionSchema).max(5),
    target: z.array(EmotionSchema).max(5),
  }),
  rootCause: z.string().max(300),
  severity: z.number().min(1).max(5),
  fixMessage: z.string().min(1).max(600),
  fixRationale: z.string().max(300),
});
export type ConflictAnalysisLLMResponse = z.infer<
  typeof ConflictAnalysisLLMResponseSchema
>;
