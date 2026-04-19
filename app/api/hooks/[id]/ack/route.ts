import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { supabase } = authed;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const action = String(body?.action ?? "dismissed");

  const { error } = await supabase
    .from("hook_deliveries")
    .update({
      acked_at: new Date().toISOString(),
      action,
    })
    .eq("id", id);

  if (error) return fail(500, "Database Error", error.message);
  return ok({ acked: true });
}
