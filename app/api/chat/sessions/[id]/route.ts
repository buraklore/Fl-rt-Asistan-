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

  if (!session) return fail(404, "Bulunamadı", "Oturum bulunamadı.");

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  return ok({ session, messages: messages ?? [] });
}

/**
 * DELETE /api/chat/sessions/[id]
 * Silme kararı verildiğinde: oturumu + mesajları + semantik hafızayı (memory
 * embeddings) tamamen temizler, böylece koç sonraki sohbetlerde eski konulara
 * referans vermez.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { id } = await params;

  // Mesajlar (FK cascade ile de silinir ama açıkça yapalım, RLS safer)
  await supabase.from("chat_messages").delete().eq("session_id", id);
  // Semantik hafıza kayıtları (memory_chunks tablosu varsa)
  await supabase.from("memory_chunks").delete().eq("session_id", id);
  // Oturum
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id);

  if (error) return fail(500, "Silme Başarısız", error.message);
  return ok({ deleted: true });
}
