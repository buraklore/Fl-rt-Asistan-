import type {
  TargetProfileForPrompt,
  UserProfileForPrompt,
  Tone,
} from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

export const GENERATOR_PROMPT_VERSION = "generator.v2"; // v2: user profile injected

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
 * v2: now receives `user` profile so replies can be calibrated to the
 * user's own communication style (direct vs indirect, playful vs reserved).
 * If the user has a defined style, the generator stays *within that voice*
 * rather than inventing a persona. This is core to the product's value —
 * we're not writing messages as a generic charismatic person, we're writing
 * them as THIS user.
 */
export function buildGeneratorSystemPrompt(args: {
  tones: Tone[];
  user: UserProfileForPrompt | null;
  target: TargetProfileForPrompt | null;
  userNote: string | null;
}): string {
  const toneBlock = args.tones
    .map((t) => `- "${t}": ${TONE_DEFINITIONS[t]}`)
    .join("\n");

  const userProfileBlock = args.user
    ? `USER PROFILE (the person sending the message — write in their voice):\n${JSON.stringify(args.user, null, 2)}`
    : "USER PROFILE: not provided. Default to a natural, unremarkable voice.";

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
in their twenties would actually send — AND they must sound like THIS user.

CONSTRAINTS
- 1–2 sentences per reply. Shorter is usually better.
- Match the incoming message's casing and punctuation level.
- Never fabricate facts about the target. If uncertain, stay generic.
- Don't start every reply the same way across tones.
- Don't use hashtags, marketing speak, or "let's" / "shall we".
- If the USER profile specifies a communicationStyle, every reply must
  plausibly sound like that person wrote it. Don't turn a reserved user
  into a hyper-flirty one just because "flirty" was requested — adapt the
  tone to their baseline voice.

TONES
${toneBlock}

${userProfileBlock}

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
