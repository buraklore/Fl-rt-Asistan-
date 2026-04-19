import { NextRequest } from "next/server";
import { UpdateUserProfileRequestSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me/profile — current user's self-profile
 * PUT /api/me/profile — upsert self-profile (all fields optional)
 *
 * The row is auto-created by a DB trigger on signup, but fields start blank.
 * Users fill them in via onboarding or settings to improve AI output quality.
 */

export async function GET() {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return fail(500, "Database Error", error.message);

  if (!data) {
    // Trigger normally creates this, but if missing (legacy user), create empty.
    return ok({
      id: user.id,
      display_name: null,
      gender: null,
      age_range: null,
      dob: null,
      interests: [],
      communication_style: null,
      attachment_style: null,
      relationship_goal: null,
      raw_bio: null,
    });
  }

  return ok(data);
}

export async function PUT(request: NextRequest) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;

  const body = await parseBody(request, UpdateUserProfileRequestSchema);
  if (body instanceof Response) return body;

  // Build update payload — only write fields that were actually sent.
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.displayName !== undefined) update.display_name = body.displayName;
  if (body.gender !== undefined) update.gender = body.gender;
  if (body.ageRange !== undefined) update.age_range = body.ageRange;
  if (body.interests !== undefined) update.interests = body.interests;
  if (body.communicationStyle !== undefined)
    update.communication_style = body.communicationStyle;
  if (body.attachmentStyle !== undefined)
    update.attachment_style = body.attachmentStyle;
  if (body.relationshipGoal !== undefined)
    update.relationship_goal = body.relationshipGoal;
  if (body.rawBio !== undefined) update.raw_bio = body.rawBio;

  try {
    // Upsert — if the row doesn't exist yet (legacy user), create it.
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({ id: user.id, ...update })
      .select()
      .single();

    if (error) return fail(500, "Database Error", error.message);
    return ok(data);
  } catch (err) {
    console.error("[user profile PUT] failed:", err);
    return fail(
      500,
      "Update Failed",
      err instanceof Error ? err.message : "Profil güncellenemedi.",
    );
  }
}
