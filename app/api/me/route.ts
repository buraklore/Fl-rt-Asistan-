import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth";
import { fail } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/me — account deletion (GDPR / KVKK right to erasure).
 *
 * Cascading cleanup:
 *  1. User-owned rows are cascade-deleted via FK (targets, chats, generations,
 *     scores, conflicts, hooks, subscriptions, usage_counters) because every
 *     table's user_id has `on delete cascade`.
 *  2. auth.users row is deleted through the service role admin API.
 *
 * Note: requires SUPABASE_SERVICE_ROLE_KEY env var. This endpoint is
 * intentionally idempotent — a deleted user who somehow calls it again
 * will already be signed out.
 */
export async function DELETE() {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user } = authed;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) {
    return fail(
      500,
      "Yapılandırma Hatası",
      "Silme şu anda sunucuda yapılandırılmamış. Lütfen destek@flortasistani.app ile iletişime geç.",
    );
  }

  // Service-role client can call admin APIs and bypass RLS for the cascade.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Delete the auth.users row — FK cascades wipe everything else.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return fail(500, "Silme Başarısız", error.message);
  }

  // 2. Return 204 No Content — client should clear local session and redirect.
  return new Response(null, { status: 204 });
}
