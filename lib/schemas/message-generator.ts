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
    .min(1, "Gelen mesaj boş olamaz.")
    .max(2000, "Gelen mesaj çok uzun."),
  context: z.string().max(1000).optional(),
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
  text: z.string().min(1).max(500),
  rationale: z.string().min(1).max(300),
});
export type Reply = z.infer<typeof ReplySchema>;

/**
 * Full LLM response envelope. Used both to parse provider output
 * and to shape the API response.
 */
export const GenerateMessageLLMResponseSchema = z.object({
  replies: z.array(ReplySchema).min(1).max(3),
});
export type GenerateMessageLLMResponse = z.infer<
  typeof GenerateMessageLLMResponseSchema
>;

/**
 * Response body from the API (wrapped in the common envelope on the wire).
 */
export const GenerateMessageResponseSchema = z.object({
  generationId: z.string(),
  replies: z.array(ReplySchema),
});
export type GenerateMessageResponse = z.infer<
  typeof GenerateMessageResponseSchema
>;
