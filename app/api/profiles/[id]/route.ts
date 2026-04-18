import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { id } = await params;

  const { data, error } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return fail(500, "Database Error", error.message);
  if (!data) return fail(404, "Not Found", "Hedef bulunamadı.");
  return ok(data);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "Invalid JSON");

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.relation !== undefined) update.relation = body.relation;
  if (body.gender !== undefined) update.gender = body.gender;
  if (body.ageRange !== undefined) update.age_range = body.ageRange;
  if (body.interests !== undefined) update.interests = body.interests;
  if (body.behaviors !== undefined) update.behaviors = body.behaviors;
  if (body.contextNotes !== undefined) update.context_notes = body.contextNotes;

  const { data, error } = await supabase
    .from("target_profiles")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(500, "Database Error", error.message);
  return ok(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { id } = await params;

  // Soft delete via RLS-protected update
  const { error } = await supabase
    .from("target_profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return fail(500, "Database Error", error.message);
  return new Response(null, { status: 204 });
}
