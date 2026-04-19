import { NextRequest } from "next/server";
import { CreateChatSessionRequestSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  const body = await parseBody(request, CreateChatSessionRequestSchema);
  if (body instanceof Response) return body;

  // Verify target ownership via RLS
  const { data: target } = await supabase
    .from("target_profiles")
    .select("id, name")
    .eq("id", body.targetId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!target) return fail(404, "Bulunamadı", "Hedef bulunamadı.");

  const { data: session, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      target_id: body.targetId,
    })
    .select()
    .single();

  if (error) return fail(500, "Veritabanı Hatası", error.message);
  return ok(session);
}

export async function GET(request: NextRequest) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;

  const targetId = request.nextUrl.searchParams.get("targetId");

  let q = supabase
    .from("chat_sessions")
    .select("*, target:target_profiles(id, name, relation)")
    .order("created_at", { ascending: false });

  if (targetId) q = q.eq("target_id", targetId);

  const { data, error } = await q;
  if (error) return fail(500, "Veritabanı Hatası", error.message);
  return ok(data ?? []);
}
