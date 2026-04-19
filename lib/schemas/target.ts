import { z } from "zod";

export const GenderSchema = z.enum([
  "male",
  "female",
  "nonbinary",
  "unspecified",
]);
export type Gender = z.infer<typeof GenderSchema>;

export const AttachmentStyleSchema = z.enum([
  "secure",
  "anxious",
  "avoidant",
  "disorganized",
]);
export type AttachmentStyle = z.infer<typeof AttachmentStyleSchema>;

export const RelationTypeSchema = z.enum([
  "crush",
  "partner",
  "ex",
  "match",
  "friend",
]);
export type RelationType = z.infer<typeof RelationTypeSchema>;

/**
 * Big Five personality scores, each 0..1.
 * Order intentionally OCEAN so serialized JSON reads naturally.
 */
export const Big5Schema = z.object({
  openness: z.number().min(0).max(1),
  conscientiousness: z.number().min(0).max(1),
  extraversion: z.number().min(0).max(1),
  agreeableness: z.number().min(0).max(1),
  neuroticism: z.number().min(0).max(1),
});
export type Big5 = z.infer<typeof Big5Schema>;

/**
 * Output of the Person Analyzer — also the structured profile
 * we inject into every AI call's context.
 */
export const TargetAnalysisSchema = z.object({
  personalityType: z.string(),
  big5: Big5Schema,
  attachmentStyle: AttachmentStyleSchema,
  communicationStyle: z.string(),
  attractionTriggers: z.array(z.string()).max(8),
  confidence: z.number().min(0).max(1),
});
export type TargetAnalysis = z.infer<typeof TargetAnalysisSchema>;

/**
 * Minimal target profile as serialized for prompts.
 * Keep this tight — every field costs tokens on every AI call.
 */
export const TargetProfileForPromptSchema = z.object({
  name: z.string().nullable(),
  relation: RelationTypeSchema,
  gender: GenderSchema.nullable(),
  ageRange: z.string().nullable(),
  interests: z.array(z.string()),
  behaviors: z.array(z.string()),
  contextNotes: z.string().nullable(),
  analysis: TargetAnalysisSchema.nullable(),
});
export type TargetProfileForPrompt = z.infer<
  typeof TargetProfileForPromptSchema
>;
