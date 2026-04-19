import { z } from "zod";
import { ToneSchema } from "./message-generator";

export const GenerateOpenerRequestSchema = z.object({
  targetId: z.string().min(1, "Açılış için hedef seçmek zorunlu"),
  situation: z
    .string()
    .max(500)
    .optional()
    .refine((v) => !v || v.length >= 20, {
      message: "Durum notu boş bırakılabilir ama yazıyorsan en az 20 karakter olsun",
    }),
  tones: z
    .array(ToneSchema)
    .min(1)
    .max(3)
    .default(["cool", "flirty", "confident"]),
});
export type GenerateOpenerRequest = z.infer<typeof GenerateOpenerRequestSchema>;

export const OpenerSchema = z.object({
  tone: ToneSchema,
  text: z.string().min(3).max(500),
  hook: z
    .string()
    .min(10, "Her açılış için hangi detaya referans verildiği belirtilmeli")
    .max(300),
  rationale: z
    .string()
    .min(20, "Her açılış için neden bu seçim olduğu belirtilmeli")
    .max(400),
});
export type Opener = z.infer<typeof OpenerSchema>;

const OpenerConfidenceSchema = z.object({
  overall: z.number().min(0).max(1),
  dataGaps: z.array(z.string().min(5).max(200)).max(6),
  explanation: z.string().min(30).max(400),
});

export const GenerateOpenerLLMResponseSchema = z.object({
  openers: z.array(OpenerSchema).min(1).max(3),
  confidence: OpenerConfidenceSchema,
});
export type GenerateOpenerLLMResponse = z.infer<
  typeof GenerateOpenerLLMResponseSchema
>;

export const GenerateOpenerResponseSchema = z.object({
  generationId: z.string().nullable(),
  openers: z.array(OpenerSchema),
  confidence: OpenerConfidenceSchema.optional(),
});
export type GenerateOpenerResponse = z.infer<
  typeof GenerateOpenerResponseSchema
>;
