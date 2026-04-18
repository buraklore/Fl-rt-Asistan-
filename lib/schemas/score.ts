import { z } from "zod";

const RiskSchema = z.object({
  label: z.string().max(60),
  severity: z.number().min(1).max(5),
  evidence: z.string().max(300),
});

const StrengthSchema = z.object({
  label: z.string().max(60),
  evidence: z.string().max(300),
});

export const RelationshipScoreLLMResponseSchema = z.object({
  compatibility: z.number().min(0).max(100),
  risks: z.array(RiskSchema).max(3),
  strengths: z.array(StrengthSchema).max(3),
  summary: z.string().max(300),
});
export type RelationshipScoreLLMResponse = z.infer<
  typeof RelationshipScoreLLMResponseSchema
>;
