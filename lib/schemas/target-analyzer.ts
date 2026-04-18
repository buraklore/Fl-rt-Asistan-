import { z } from "zod";
import {
  Big5Schema,
  AttachmentStyleSchema,
  RelationTypeSchema,
  GenderSchema,
} from "./target";

export const CreateTargetRequestSchema = z.object({
  name: z.string().max(40).optional(),
  relation: RelationTypeSchema,
  gender: GenderSchema.optional(),
  ageRange: z.string().max(20).optional(),
  interests: z.array(z.string().max(60)).max(15).default([]),
  behaviors: z.array(z.string().max(120)).max(15).default([]),
  contextNotes: z.string().max(1000).optional(),
});
export type CreateTargetRequest = z.infer<typeof CreateTargetRequestSchema>;

export const AnalyzeTargetLLMResponseSchema = z.object({
  personalityType: z.string().max(60),
  big5: Big5Schema,
  attachmentStyle: AttachmentStyleSchema,
  communicationStyle: z.string().max(200),
  attractionTriggers: z.array(z.string().max(80)).min(1).max(6),
  confidence: z.number().min(0).max(1),
  rationale: z.string().max(400),
});
export type AnalyzeTargetLLMResponse = z.infer<
  typeof AnalyzeTargetLLMResponseSchema
>;
