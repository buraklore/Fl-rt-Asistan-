import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkProfileCompleteness } from "@/lib/schemas";

/**
 * Check if the authenticated user's profile is complete enough for AI use.
 * Returns null if complete, or { complete: false, missingFields: [] } if not.
 */
export async function requireCompleteProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_profiles")
    .select(
      "display_name, gender, age_range, interests, communication_style, attachment_style, relationship_goal, raw_bio, own_dynamic_style, own_expression_style, own_relationship_energy, attracted_to_dynamic_styles, attracted_to_expression_styles, attracted_to_energies",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!data) {
    return {
      complete: false as const,
      missingFields: [
        "Takma ad",
        "Cinsiyet",
        "Yaş aralığı",
        "İlgi alanları (en az 3)",
        "İletişim stili",
        "Bağlanma stili",
        "İlişki hedefi",
        "Kendin hakkında",
        "Kendi dinamik tarzın",
        "Kendi ifade tarzın",
        "Kendi ilişki enerjin",
        "Hoşlandığın dinamik tarz(lar)",
        "Hoşlandığın ifade tarz(lar)",
        "Hoşlandığın enerji tarz(lar)",
      ],
    };
  }

  return checkProfileCompleteness(data);
}