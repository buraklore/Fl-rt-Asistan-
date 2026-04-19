import { z } from "zod";
import {
  Big5Schema,
  AttachmentStyleSchema,
  RelationTypeSchema,
  GenderSchema,
  DynamicStyleSchema,
  ExpressionStyleSchema,
  RelationshipEnergySchema,
} from "./target";

export const CreateTargetRequestSchema = z.object({
  name: z
    .string()
    .min(2, "İsim veya takma ad en az 2 karakter olmalı")
    .max(40),
  relation: RelationTypeSchema,
  gender: GenderSchema,
  ageRange: z.enum(["18-24", "25-34", "35-44", "45+", "bilmiyorum"]),
  interests: z
    .array(
      z
        .string()
        .min(4, "Her ilgi alanı en az 4 karakter olmalı")
        .max(60),
    )
    .min(3, "En az 3 ilgi alanı gerekli — AI doğru analiz için çeşitli sinyallere ihtiyaç duyuyor")
    .max(15),
  behaviors: z
    .array(
      z
        .string()
        .min(15, "Her davranış notu en az 15 karakter olmalı (tek kelime yetmez)")
        .max(200),
    )
    .min(3, "En az 3 davranış notu gerekli")
    .max(15),
  contextNotes: z
    .string()
    .min(80, "Nasıl tanıştığınız ve bağlam en az 80 karakter olmalı")
    .max(2000),
  // Archetype — observed by user
  dynamicStyle: DynamicStyleSchema,
  expressionStyle: ExpressionStyleSchema,
  relationshipEnergy: RelationshipEnergySchema,
});
export type CreateTargetRequest = z.infer<typeof CreateTargetRequestSchema>;

const ConfidenceSchema = z.object({
  overall: z.number().min(0).max(1),
  dataGaps: z.array(z.string().min(5).max(200)).max(6),
  explanation: z.string().min(30).max(400),
});

/**
 * Coaching advice — personalized recommendations for how to interact
 * with this specific target. Produced in the same LLM call as the personality
 * analysis to share context and cut cost in half.
 */
const CoachingAdviceSchema = z.object({
  doNow: z
    .array(
      z.object({
        action: z
          .string()
          .min(20, "Her somut aksiyon en az bir cümle olmalı")
          .max(300),
        why: z
          .string()
          .min(20, "Her aksiyon için gerekçe zorunlu")
          .max(300),
      }),
    )
    .min(2, "En az 2 somut aksiyon gerekli")
    .max(4),
  avoid: z
    .array(
      z.object({
        what: z
          .string()
          .min(15, "Her kaçınma noktası net olmalı")
          .max(250),
        why: z
          .string()
          .min(15)
          .max(250),
      }),
    )
    .min(2, "En az 2 kaçınma noktası gerekli")
    .max(4),
  growthAreas: z
    .array(
      z
        .string()
        .min(25, "Her gelişim alanı somut olmalı")
        .max(300),
    )
    .min(2)
    .max(4),
  redFlags: z
    .array(
      z.object({
        signal: z
          .string()
          .min(15, "Kırmızı bayrak net olmalı")
          .max(250),
        meaning: z.string().min(15).max(300),
      }),
    )
    .max(4),
});
export type CoachingAdvice = z.infer<typeof CoachingAdviceSchema>;

export const AnalyzeTargetLLMResponseSchema = z.object({
  personalityType: z.string().min(5).max(80),
  big5: Big5Schema,
  attachmentStyle: AttachmentStyleSchema,
  communicationStyle: z
    .string()
    .min(25, "İletişim stili açıklaması en az bir cümle olmalı")
    .max(300),
  attractionTriggers: z.array(z.string().min(5).max(100)).min(2).max(6),
  confidence: z.number().min(0).max(1),
  rationale: z
    .string()
    .min(50, "Gerekçe en az iki cümle olmalı")
    .max(600),
  confidenceDetail: ConfidenceSchema,
  coachingAdvice: CoachingAdviceSchema,
});
export type AnalyzeTargetLLMResponse = z.infer<
  typeof AnalyzeTargetLLMResponseSchema
>;
