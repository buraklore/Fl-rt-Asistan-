import { z } from "zod";
import {
  GenderSchema,
  AttachmentStyleSchema,
  DynamicStyleSchema,
  ExpressionStyleSchema,
  RelationshipEnergySchema,
  type DynamicStyle,
  type ExpressionStyle,
  type RelationshipEnergy,
} from "./target";

// Partial update — every field optional but if present must meet quality bar
export const UpdateUserProfileRequestSchema = z.object({
  displayName: z
    .string()
    .min(2, "Takma ad en az 2 karakter olmalı")
    .max(40)
    .optional(),
  gender: GenderSchema.optional(),
  ageRange: z
    .enum(["18-24", "25-34", "35-44", "45+"])
    .optional(),
  interests: z
    .array(
      z
        .string()
        .min(4, "Her ilgi alanı en az 4 karakter olmalı")
        .max(60),
    )
    .min(3, "En az 3 ilgi alanı gerekli")
    .max(20)
    .optional(),
  communicationStyle: z
    .string()
    .min(50, "İletişim stilini biraz daha açıkla — en az 50 karakter")
    .max(500)
    .optional(),
  attachmentStyle: AttachmentStyleSchema.optional(),
  relationshipGoal: z
    .enum(["dating", "long-term", "reconnect", "conflict", "friend"])
    .optional(),
  rawBio: z
    .string()
    .min(100, "Kendin hakkında biraz daha yaz — en az 100 karakter")
    .max(2000)
    .optional(),
  // Own archetype (single on each axis)
  ownDynamicStyle: DynamicStyleSchema.optional(),
  ownExpressionStyle: ExpressionStyleSchema.optional(),
  ownRelationshipEnergy: RelationshipEnergySchema.optional(),
  // Attracted-to archetypes (multi-select per axis, 1-2 each)
  attractedToDynamicStyles: z
    .array(DynamicStyleSchema)
    .min(1, "Hoşlandığın en az bir dinamik tarzı seç")
    .max(3)
    .optional(),
  attractedToExpressionStyles: z
    .array(ExpressionStyleSchema)
    .min(1, "Hoşlandığın en az bir ifade tarzı seç")
    .max(2)
    .optional(),
  attractedToEnergies: z
    .array(RelationshipEnergySchema)
    .min(1, "Hoşlandığın en az bir enerji tarzı seç")
    .max(2)
    .optional(),
});
export type UpdateUserProfileRequest = z.infer<
  typeof UpdateUserProfileRequestSchema
>;

export const CompleteUserProfileSchema = z.object({
  displayName: z.string().min(2),
  gender: GenderSchema,
  ageRange: z.enum(["18-24", "25-34", "35-44", "45+"]),
  interests: z.array(z.string().min(4)).min(3),
  communicationStyle: z.string().min(50),
  attachmentStyle: AttachmentStyleSchema,
  relationshipGoal: z.enum([
    "dating",
    "long-term",
    "reconnect",
    "conflict",
    "friend",
  ]),
  rawBio: z.string().min(100),
  ownDynamicStyle: DynamicStyleSchema,
  ownExpressionStyle: ExpressionStyleSchema,
  ownRelationshipEnergy: RelationshipEnergySchema,
  attractedToDynamicStyles: z.array(DynamicStyleSchema).min(1),
  attractedToExpressionStyles: z.array(ExpressionStyleSchema).min(1),
  attractedToEnergies: z.array(RelationshipEnergySchema).min(1),
});

/**
 * Check profile completeness based on DB row shape.
 */
export function checkProfileCompleteness(row: {
  display_name?: string | null;
  gender?: string | null;
  age_range?: string | null;
  interests?: string[] | null;
  communication_style?: string | null;
  attachment_style?: string | null;
  relationship_goal?: string | null;
  raw_bio?: string | null;
  own_dynamic_style?: string | null;
  own_expression_style?: string | null;
  own_relationship_energy?: string | null;
  attracted_to_dynamic_styles?: string[] | null;
  attracted_to_expression_styles?: string[] | null;
  attracted_to_energies?: string[] | null;
}): { complete: boolean; missingFields: string[] } {
  const missing: string[] = [];

  if (!row.display_name || row.display_name.length < 2) missing.push("Takma ad");
  if (!row.gender) missing.push("Cinsiyet");
  if (!row.age_range) missing.push("Yaş aralığı");
  if (!row.interests || row.interests.length < 3) missing.push("İlgi alanları (en az 3)");
  if (!row.communication_style || row.communication_style.length < 50)
    missing.push("İletişim stili");
  if (!row.attachment_style) missing.push("Bağlanma stili");
  if (!row.relationship_goal) missing.push("İlişki hedefi");
  if (!row.raw_bio || row.raw_bio.length < 100) missing.push("Kendin hakkında");
  if (!row.own_dynamic_style) missing.push("Kendi dinamik tarzın");
  if (!row.own_expression_style) missing.push("Kendi ifade tarzın");
  if (!row.own_relationship_energy) missing.push("Kendi ilişki enerjin");
  if (!row.attracted_to_dynamic_styles || row.attracted_to_dynamic_styles.length < 1)
    missing.push("Hoşlandığın dinamik tarz(lar)");
  if (!row.attracted_to_expression_styles || row.attracted_to_expression_styles.length < 1)
    missing.push("Hoşlandığın ifade tarz(lar)");
  if (!row.attracted_to_energies || row.attracted_to_energies.length < 1)
    missing.push("Hoşlandığın enerji tarz(lar)");

  return { complete: missing.length === 0, missingFields: missing };
}

/**
 * Shape used in AI prompts when injecting user context.
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
  ownDynamicStyle: DynamicStyle | null;
  ownExpressionStyle: ExpressionStyle | null;
  ownRelationshipEnergy: RelationshipEnergy | null;
  attractedToDynamicStyles: DynamicStyle[];
  attractedToExpressionStyles: ExpressionStyle[];
  attractedToEnergies: RelationshipEnergy[];
};
