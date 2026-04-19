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

export const AnalyzeTargetLLMResponseSchema = z.object({
  personalityType: z.string().min(5).max(80),
  big5: Big5Schema,
  attachmentStyle: AttachmentStyleSchema,
  communicationStyle: z
    .string()
    .min(25, "İletişim stili açıklaması en az bir cümle olmalı")
    .max(300),
  attractionTriggers: z.array(z.string().min(5).max(100)).min(2).max(6),
  confidence: z.number().min(0).max(1), // legacy numeric field, keep
  rationale: z
    .string()
    .min(50, "Gerekçe en az iki cümle olmalı")
    .max(600),
  confidenceDetail: ConfidenceSchema,
});
export type AnalyzeTargetLLMResponse = z.infer<
  typeof AnalyzeTargetLLMResponseSchema
>;
