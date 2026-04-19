import { z } from "zod";
import { GenderSchema, AttachmentStyleSchema } from "./target";

/**
 * The user's own profile — what they share about themselves so the AI
 * can contextualize every piece of advice and compute real compatibility.
 *
 * Every field is optional — users can fill in as much or as little as they
 * want. More detail = sharper output.
 */
export const UpdateUserProfileRequestSchema = z.object({
  displayName: z.string().max(40).optional(),
  gender: GenderSchema.optional(),
  ageRange: z.string().max(20).optional(),
  interests: z.array(z.string().max(60)).max(20).optional(),
  communicationStyle: z.string().max(300).optional(),
  attachmentStyle: AttachmentStyleSchema.optional(),
  relationshipGoal: z.string().max(60).optional(),
  rawBio: z.string().max(1500).optional(),
});
export type UpdateUserProfileRequest = z.infer<
  typeof UpdateUserProfileRequestSchema
>;

/**
 * Shape used in AI prompts when injecting user context.
 * Null means "unknown" — AI should stay generic about that aspect.
 */
export type UserProfileForPrompt = {
  displayName: string | null;
  gender: "male" | "female" | "nonbinary" | "unspecified" | null;
  ageRange: string | null;
  interests: string[];
  communicationStyle: string | null;
  attachmentStyle:
    | "secure"
    | "anxious"
    | "avoidant"
    | "disorganized"
    | null;
  relationshipGoal: string | null;
  rawBio: string | null;
};
