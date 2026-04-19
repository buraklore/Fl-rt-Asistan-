import { NextRequest } from "next/server";
import { buildCoachSystemPrompt, buildContext } from "@/lib/ai";
import { streamChat } from "@/lib/ai/stream";
import {
  SendChatMessageRequestSchema,
  type TargetProfileForPrompt,
  type UserProfileForPrompt,
} from "@/lib/schemas";
import { requireUser } from "@/lib/auth";
import { enforceQuota } from "@/lib/quota";
import { fail, parseBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST a message to a chat session; returns an SSE stream with the
 * assistant response. Events:
 *   event: delta   data: {"text": "..."}
 *   event: done    data: {"messageId": "...", "fullText": "..."}
 *   event: error   data: {"message": "..."}
 */
export async function POST(request: NextRequest, { params }: Params) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user, supabase } = authed;
  const { id: sessionId } = await params;

  const body = await parseBody(request, SendChatMessageRequestSchema);
  if (body instanceof Response) return body;

  const quota = await enforceQuota(user.id, "chat");
  if (!quota.ok) return quota.response;

  // Load session + target (RLS ensures ownership)
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("*, target:target_profiles(*)")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return fail(404, "Not Found", "Oturum bulunamadı.");

  // Persist user message
  await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId, role: "user", content: body.content });

  // Load recent 12 turns
  const { data: recent } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(12);

  const orderedRecent = (recent ?? []).slice().reverse();

  const target: TargetProfileForPrompt | null = session.target
    ? {
        name: session.target.name,
        relation:
          (session.target.relation as "crush" | "partner" | "ex" | "match" | "friend") ??
          "crush",
        gender: session.target.gender,
        ageRange: session.target.age_range,
        interests: session.target.interests ?? [],
        behaviors: session.target.behaviors ?? [],
        contextNotes: session.target.context_notes,
        analysis: null,
      }
    : null;

  const { contextBlock } = buildContext({
    target,
    recentTurns: orderedRecent.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    })),
  });

  // Load user's own profile so coach can calibrate to their style
  const { data: userRow } = await supabase
    .from("user_profiles")
    .select(
      "display_name, gender, age_range, interests, communication_style, attachment_style, relationship_goal, raw_bio",
    )
    .eq("id", user.id)
    .maybeSingle();

  const userForPrompt: UserProfileForPrompt | null = userRow
    ? {
        displayName: userRow.display_name ?? null,
        gender: userRow.gender ?? null,
        ageRange: userRow.age_range ?? null,
        interests: userRow.interests ?? [],
        communicationStyle: userRow.communication_style ?? null,
        attachmentStyle: userRow.attachment_style ?? null,
        relationshipGoal: userRow.relationship_goal ?? null,
        rawBio: userRow.raw_bio ?? null,
      }
    : null;

  const system = buildCoachSystemPrompt({
    user: userForPrompt,
    target,
    memoryContext: contextBlock,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const write = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const result = await streamChat(
          {
            system,
            messages: orderedRecent.map(
              (m: { role: string; content: string }) => ({
                role: (m.role === "user" ? "user" : "assistant") as
                  | "user"
                  | "assistant",
                content: m.content,
              }),
            ),
            maxTokens: 800,
            temperature: 0.7,
          },
          (chunk) => {
            if (chunk.type === "delta") write("delta", { text: chunk.text });
          },
        );

        const { data: saved } = await supabase
          .from("chat_messages")
          .insert({
            session_id: sessionId,
            role: "assistant",
            content: result.fullText,
            model: result.model,
            tokens_in: result.inputTokens,
            tokens_out: result.outputTokens,
          })
          .select("id")
          .single();

        // First-reply auto-title
        if (!session.title && result.fullText.length > 0) {
          await supabase
            .from("chat_sessions")
            .update({
              title: result.fullText.slice(0, 60).replace(/\s+/g, " ").trim(),
            })
            .eq("id", sessionId);
        }

        write("done", {
          messageId: saved?.id ?? null,
          fullText: result.fullText,
        });
      } catch (err) {
        write("error", {
          message: err instanceof Error ? err.message : "stream error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
