import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

/**
 * Standard success envelope used by every route handler.
 */
export function ok<T>(
  data: T,
  meta: Record<string, unknown> = {},
): NextResponse {
  return NextResponse.json({ data, meta });
}

/**
 * RFC 7807 problem+json error response.
 */
export function fail(
  status: number,
  title: string,
  detail?: string,
  extra: Record<string, unknown> = {},
): NextResponse {
  return NextResponse.json(
    {
      type: `https://rizzai.app/errors/${slugify(title)}`,
      title,
      status,
      detail,
      ...extra,
    },
    {
      status,
      headers: { "Content-Type": "application/problem+json" },
    },
  );
}

/**
 * Validate a request body against a Zod schema. Returns the parsed body
 * on success, or a 400 NextResponse the caller can return directly.
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<T | NextResponse> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail(400, "Invalid JSON", "İstek gövdesi geçerli JSON değil.");
  }

  try {
    return schema.parse(json);
  } catch (err) {
    if (err instanceof ZodError) {
      return fail(
        400,
        "Validation Failed",
        err.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; "),
        { issues: err.issues },
      );
    }
    return fail(400, "Validation Failed", "Bilinmeyen doğrulama hatası.");
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}
