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

  const { data: session } = await supabase
    .from("chat_sessions")
    .select("*, target:target_profiles(id, name, relation)")
    .eq("id", id)
    .maybeSingle();

  if (!session) return fail(404, "Not Found", "Oturum bulunamadı.");

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  return ok({ session, messages: messages ?? [] });
}
