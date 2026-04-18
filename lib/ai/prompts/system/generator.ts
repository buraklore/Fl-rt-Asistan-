import type { TargetProfileForPrompt, Tone } from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

export const GENERATOR_PROMPT_VERSION = "generator.v1";

const TONE_DEFINITIONS: Record<Tone, string> = {
  cool: "grounded, low-effort-looking, slightly witty. No eagerness. No emoji unless the incoming message used one.",
  flirty:
    "playful, light tease, never sexual unless both sides already are. At most one emoji, and only if the incoming message used one.",
  confident:
    "direct, non-apologetic, assumes value without bragging. Short sentences.",
};

/**
 * Build the full system prompt for a Message Generator call.
 *
 * Design notes:
 * - The JSON output schema is re-stated inline so the model sees it
 *   next to the constraints, not just in a separate "respond with JSON"
 *   instruction. This materially improves output compliance.
 * - Target profile is serialized as compact JSON — no prose rendering.
 *   The model reads structured data better than English sentences
 *   describing structured data.
 * - We explicitly forbid fabricating facts about the target. Hallucinated
 *   personal details are the #1 failure mode for this feature.
 */
export function buildGeneratorSystemPrompt(args: {
  tones: Tone[];
  target: TargetProfileForPrompt | null;
  userNote: string | null;
}): string {
  const toneBlock = args.tones
    .map((t) => `- "${t}": ${TONE_DEFINITIONS[t]}`)
    .join("\n");

  const targetBlock = args.target
    ? `TARGET PROFILE (JSON):\n${JSON.stringify(args.target, null, 2)}`
    : "TARGET PROFILE: unknown (the user hasn't created a profile for this person yet — stay generic, don't invent details).";

  const userBlock = args.userNote
    ? `USER CONTEXT NOTE:\n${args.userNote}`
    : "USER CONTEXT NOTE: (none)";

  return `${BASE_SYSTEM_PROMPT}

TASK: Message Generator
Given the last message the target sent to the user, produce one reply
per requested tone. Replies must sound like something a real person
in their twenties would actually send.

CONSTRAINTS
- 1–2 sentences per reply. Shorter is usually better.
- Match the incoming message's casing and punctuation level.
- Never fabricate facts about the target. If uncertain, stay generic.
- Don't start every reply the same way across tones.
- Don't use hashtags, marketing speak, or "let's" / "shall we".

TONES
${toneBlock}

${targetBlock}

${userBlock}

OUTPUT FORMAT — STRICT
Return a single JSON object, no prose, no markdown fences:
{
  "replies": [
    { "tone": "<one of the requested tones>", "text": "<the reply>", "rationale": "<1 short sentence explaining the choice>" }
  ]
}
Exactly one entry per requested tone, in the order requested.
`;
}

/**
 * Build the user-turn message. Keeping this separate makes the
 * prompt easier to A/B test — the system prompt is cacheable,
 * only the user turn changes per request.
 */
export function buildGeneratorUserMessage(incomingMessage: string): string {
  return `Incoming message from the target:\n"""\n${incomingMessage}\n"""`;
}
