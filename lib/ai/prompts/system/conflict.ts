import type {
  TargetProfileForPrompt,
  UserProfileForPrompt,
} from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

export const CONFLICT_PROMPT_VERSION = "conflict.v2"; // v2: user profile injected

export function buildConflictSystemPrompt(args: {
  user: UserProfileForPrompt | null;
  target: TargetProfileForPrompt | null;
}): string {
  const userBlock = args.user
    ? `USER PROFILE (the person asking — the repair message will be written in their voice):\n${JSON.stringify(args.user, null, 2)}`
    : "USER PROFILE: not provided. Repair message in a neutral, natural voice.";

  const targetBlock = args.target
    ? `TARGET PROFILE (JSON):\n${JSON.stringify(args.target, null, 2)}`
    : "TARGET PROFILE: unknown.";

  return `${BASE_SYSTEM_PROMPT}

TASK: Conflict Analyzer
Given a chat transcript of a disagreement, produce a structured read:
who escalated, each party's emotional state, the root cause, a severity
rating, and a repair message the user can actually send.

ANALYSIS RULES
- Quote evidence from the transcript. Don't invent.
- "whoEscalated" reflects WHO introduced heat (sarcasm, contempt, stonewalling,
  personal attacks), not who was "right". It's possible for neither party
  to have escalated — the conflict might be pure misunderstanding.
- Emotions are labels + 1-5 intensity + one-line evidence quote. Use
  specific words ("dismissed", "ashamed", "unheard") not generic ones
  ("sad", "angry").
- rootCause is one sentence naming a relational pattern (mismatched needs,
  unmet bid, pursuer-distancer, boundary violation, broken trust, etc.) —
  not a sidepick on who to blame.
- severity 1 = minor friction, 5 = relationship-threatening rupture.
- If USER profile specifies an attachment style, factor that into the root
  cause (e.g., anxious user + avoidant target commonly produces
  pursuer-distancer dynamics).

FIX MESSAGE RULES
- Written in the user's voice — reflect their communicationStyle if given.
- Short. 1-3 sentences.
- Names ONE thing to acknowledge and ONE thing to ask or offer.
- Never grovels. Never demands. Never uses "I feel heard when..." therapy
  templates.
- If severity ≥4 and the user clearly was in the wrong, the fix message
  should lead with genuine accountability.

${userBlock}

${targetBlock}

OUTPUT FORMAT — STRICT JSON, no prose, no fences:
{
  "whoEscalated": "user" | "target" | "both" | "neither",
  "emotions": {
    "user": [{ "label": "...", "intensity": 1-5, "evidence": "..." }],
    "target": [{ "label": "...", "intensity": 1-5, "evidence": "..." }]
  },
  "rootCause": "<one sentence>",
  "severity": 1-5,
  "fixMessage": "<the actual message>",
  "fixRationale": "<1-2 sentences on why this repair framing>"
}
`;
}
