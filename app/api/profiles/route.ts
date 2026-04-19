import { NextRequest } from "next/server";
import { CreateTargetRequestSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { requireCompleteProfile } from "@/lib/profile-gate";
import { fail, ok, parseBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  const profileCheck = await requireCompleteProfile(user.id);
  if (!profileCheck.complete) {
    return fail(
      412,
      "Profil Tamamlanmamış",
      `Hedef oluşturmak için önce profilini tamamla. Eksikler: ${profileCheck.missingFields.join(", ")}`,
      { missingFields: profileCheck.missingFields },
    );
  }

  const body = await parseBody(request, CreateTargetRequestSchema);
  if (body instanceof Response) return body;

  const { data, error } = await supabase
    .from("target_profiles")
    .insert({
      user_id: user.id,
      name: body.name,
      relation: body.relation,
      gender: body.gender,
      age_range: body.ageRange,
      interests: body.interests,
      behaviors: body.behaviors,
      context_notes: body.contextNotes,
      dynamic_style: body.dynamicStyle,
      expression_style: body.expressionStyle,
      relationship_energy: body.relationshipEnergy,
    })
    .select()
    .single();

  if (error) return fail(500, "Veritabanı Hatası", error.message);
  return ok(data);
}

export async function GET() {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;

  const { data, error } = await supabase
    .from("target_profiles")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) return fail(500, "Veritabanı Hatası", error.message);
  return ok(data ?? []);
}
