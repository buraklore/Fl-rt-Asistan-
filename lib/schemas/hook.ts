import { z } from "zod";

export const HookCategorySchema = z.enum([
  "reignite",
  "curiosity",
  "vulnerability",
  "playful",
]);
export type HookCategory = z.infer<typeof HookCategorySchema>;

export const HookLLMResponseSchema = z.object({
  category: HookCategorySchema,
  text: z.string().min(1).max(300),
  rationale: z.string().max(200),
});
export type HookLLMResponse = z.infer<typeof HookLLMResponseSchema>;

export const DailyHookDtoSchema = z.object({
  id: z.string(),
  category: HookCategorySchema,
  text: z.string(),
  targetId: z.string().nullable(),
  targetName: z.string().nullable(),
  deliveredAt: z.string(),
});
export type DailyHookDto = z.infer<typeof DailyHookDtoSchema>;
