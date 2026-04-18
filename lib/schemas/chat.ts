import { z } from "zod";

export const CreateChatSessionRequestSchema = z.object({
  targetId: z.string().min(1),
});
export type CreateChatSessionRequest = z.infer<
  typeof CreateChatSessionRequestSchema
>;

export const SendChatMessageRequestSchema = z.object({
  content: z.string().min(1).max(4000),
});
export type SendChatMessageRequest = z.infer<
  typeof SendChatMessageRequestSchema
>;

export const ChatMessageDtoSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.string(),
});
export type ChatMessageDto = z.infer<typeof ChatMessageDtoSchema>;
