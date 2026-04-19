import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/conflicts — list all conflict analyses for the user
 * Returns newest first.
 */
export async function GET() {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;

  const { data, error } = await supabase
    .from("conflict_analyses")
    .select(
      "id, target_id, who_escalated, root_cause, severity, created_at, target:target_profiles(id, name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return fail(500, "Veritabanı Hatası", error.message);
  return ok(data ?? []);
}
