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
 * Romantic archetype — three orthogonal axes for maximum signal.
 * Used both on USER (own + attracted-to) and TARGET (observed).
 *
 * Axis 1: dynamic  — who leads the relationship dance
 * Axis 2: expression — how they show romantic energy
 * Axis 3: tempo — the pace/energy of the connection
 */
export const DynamicStyleSchema = z.enum([
  "dominant-leading",  // Dominant & Yönlendiren
  "dominant-caring",   // Dominant & Destekleyen
  "balanced-mutual",   // Dengeli & Karşılıklı
  "yielding-follower", // Takip eden & Teslim olan
  "independent-distant", // Bağımsız & Mesafeli
]);
export type DynamicStyle = z.infer<typeof DynamicStyleSchema>;

export const ExpressionStyleSchema = z.enum([
  "masculine", // Eril — direkt, koruyucu, aksiyon odaklı
  "feminine",  // Dişil — sezgisel, besleyen, duygusal ifadeli
  "androgynous", // Androjen — ikisinin esnek dengesi
]);
export type ExpressionStyle = z.infer<typeof ExpressionStyleSchema>;

export const RelationshipEnergySchema = z.enum([
  "intense-passionate", // Tutkulu & Yoğun
  "calm-stable",        // Sakin & Stabil
  "playful-light",      // Oyuncu & Hafif
  "deep-intellectual",  // Derin & Entelektüel
]);
export type RelationshipEnergy = z.infer<typeof RelationshipEnergySchema>;

/**
 * Turkish labels for archetype enums — used in UI and prompts.
 */
export const DYNAMIC_LABELS: Record<DynamicStyle, string> = {
  "dominant-leading": "Dominant & Yönlendiren",
  "dominant-caring": "Dominant & Destekleyen",
  "balanced-mutual": "Dengeli & Karşılıklı",
  "yielding-follower": "Takip eden & Teslim olan",
  "independent-distant": "Bağımsız & Mesafeli",
};

export const EXPRESSION_LABELS: Record<ExpressionStyle, string> = {
  masculine: "Eril",
  feminine: "Dişil",
  androgynous: "Androjen",
};

export const ENERGY_LABELS: Record<RelationshipEnergy, string> = {
  "intense-passionate": "Tutkulu & Yoğun",
  "calm-stable": "Sakin & Stabil",
  "playful-light": "Oyuncu & Hafif",
  "deep-intellectual": "Derin & Entelektüel",
};

/**
 * Big Five personality scores, each 0..1.
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
  dynamicStyle: DynamicStyleSchema.nullable(),
  expressionStyle: ExpressionStyleSchema.nullable(),
  relationshipEnergy: RelationshipEnergySchema.nullable(),
});
export type TargetProfileForPrompt = z.infer<
  typeof TargetProfileForPromptSchema
>;
