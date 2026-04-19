import { z } from "zod";

/**
 * Tones supported by the Message Generator.
 * These strings also appear in the system prompt, so keep them stable.
 */
export const ToneSchema = z.enum(["cool", "flirty", "confident"]);
export type Tone = z.infer<typeof ToneSchema>;

/**
 * Request body for POST /v1/messages/generate
 */
export const GenerateMessageRequestSchema = z.object({
  targetId: z.string().min(1).optional(),
  incomingMessage: z
    .string()
    .min(5, "Gelen mesaj en az 5 karakter olmalı")
    .max(2000, "Gelen mesaj çok uzun."),
  context: z
    .string()
    .max(1000)
    .refine((v) => !v || v.length >= 20, {
      message: "Bağlam notu boş bırakılabilir ama yazıyorsan en az 20 karakter olsun",
    })
    .optional(),
  tones: z
    .array(ToneSchema)
    .min(1)
    .max(3)
    .default(["cool", "flirty", "confident"]),
});
export type GenerateMessageRequest = z.infer<
  typeof GenerateMessageRequestSchema
>;

/**
 * Shape of a single generated reply. This is what the LLM must return,
 * and also what the client renders. One schema, zero drift.
 */
export const ReplySchema = z.object({
  tone: ToneSchema,
  text: z.string().min(3).max(600),
  rationale: z
    .string()
    .min(25, "Her cevap için neden-açıklaması en az bir cümle olmalı")
    .max(400),
});
export type Reply = z.infer<typeof ReplySchema>;

const GeneratorConfidenceSchema = z.object({
  overall: z.number().min(0).max(1),
  dataGaps: z.array(z.string().min(5).max(200)).max(6),
  explanation: z.string().min(30).max(400),
});

/**
 * Full LLM response envelope. Used both to parse provider output
 * and to shape the API response.
 */
export const GenerateMessageLLMResponseSchema = z.object({
  replies: z.array(ReplySchema).min(1).max(3),
  confidence: GeneratorConfidenceSchema,
});
export type GenerateMessageLLMResponse = z.infer<
  typeof GenerateMessageLLMResponseSchema
>;

/**
 * Response body from the API (wrapped in the common envelope on the wire).
 */
export const GenerateMessageResponseSchema = z.object({
  generationId: z.string().nullable(),
  replies: z.array(ReplySchema),
  confidence: GeneratorConfidenceSchema.optional(),
});
export type GenerateMessageResponse = z.infer<
  typeof GenerateMessageResponseSchema
>;
