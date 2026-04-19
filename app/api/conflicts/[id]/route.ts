import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/conflicts/[id] — fetch a single conflict analysis
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { id } = await params;

  const { data, error } = await supabase
    .from("conflict_analyses")
    .select("*, target:target_profiles(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(500, "Veritabanı Hatası", error.message);
  if (!data) return fail(404, "Bulunamadı", "Çatışma kaydı bulunamadı.");
  return ok(data);
}

/**
 * DELETE /api/conflicts/[id] — hard delete (user can always purge their own records)
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { id } = await params;

  const { error } = await supabase
    .from("conflict_analyses")
    .delete()
    .eq("id", id);

  if (error) return fail(500, "Silme Başarısız", error.message);
  return ok({ deleted: true });
}
