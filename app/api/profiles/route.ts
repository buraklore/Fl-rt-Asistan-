import { NextRequest } from "next/server";
import { CreateTargetRequestSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  const body = await parseBody(request, CreateTargetRequestSchema);
  if (body instanceof Response) return body;

  const { data, error } = await supabase
    .from("target_profiles")
    .insert({
      user_id: user.id,
      name: body.name ?? null,
      relation: body.relation,
      gender: body.gender ?? null,
      age_range: body.ageRange ?? null,
      interests: body.interests,
      behaviors: body.behaviors,
      context_notes: body.contextNotes ?? null,
    })
    .select()
    .single();

  if (error) return fail(500, "Database Error", error.message);
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

  if (error) return fail(500, "Database Error", error.message);
  return ok(data ?? []);
}
