import type {
  TargetProfileForPrompt,
  UserProfileForPrompt,
} from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

// ---------- Relationship Score ----------

export const SCORER_PROMPT_VERSION = "scorer.v2"; // v2: user profile injected

export function buildScorerSystemPrompt(args: {
  user: UserProfileForPrompt | null;
  target: TargetProfileForPrompt | null;
  recentActivity: {
    generationsLast7Days: number;
    conflictsLast30Days: number;
    averageResponseLagHours: number | null;
  };
}): string {
  return `${BASE_SYSTEM_PROMPT}

TASK: Relationship Score — compatibility between THE USER and THE TARGET.
Compute a compatibility 0-100 with top-3 risks and top-3 strengths, grounded
in BOTH profiles and recent activity. This is a two-sided score: it is about
the *fit* between these two specific people, not just the target's general
desirability.

SCORING RULES
- 80-100: strong alignment on attachment style, communication, goals, values.
- 60-79:  compatible but meaningful mismatch in one dimension (attachment/goal/pace).
- 40-59:  workable with explicit effort; friction in multiple dimensions.
- 20-39:  structural incompatibility (e.g., anxious↔avoidant, different goals).
- 0-19:   severe mismatch; recommend stepping back.

COMPATIBILITY HEURISTICS — use these unless profiles strongly contradict:
- Anxious ↔ avoidant pair: mark as a risk, not a deal-breaker.
- Mismatched relationship goals (e.g., "dating" ↔ "long-term"): major risk.
- Overlapping interests: mild strength; rarely decisive alone.
- Communication style mismatch (direct ↔ indirect): risk with moderate severity.

- Risks must cite specific evidence from EITHER profile OR recent activity.
- Don't invent data. If either profile is mostly empty, keep confidence
  moderate and flag that in the summary.

${
  args.user
    ? `USER PROFILE (JSON) — this is the person asking:\n${JSON.stringify(args.user, null, 2)}`
    : "USER PROFILE: not provided. Score with lower confidence, skip user-side risks/strengths."
}

${
  args.target
    ? `TARGET PROFILE (JSON):\n${JSON.stringify(args.target, null, 2)}`
    : "TARGET PROFILE: unknown (return moderate scores with low-confidence language)."
}

RECENT ACTIVITY:
${JSON.stringify(args.recentActivity, null, 2)}

OUTPUT — STRICT JSON:
{
  "compatibility": 0-100,
  "risks":    [{ "label": "...", "severity": 1-5, "evidence": "..." }],
  "strengths":[{ "label": "...", "evidence": "..." }],
  "summary": "<one sentence overall read of the fit>"
}
`;
}

// ---------- Daily Hooks ----------

export const HOOKS_PROMPT_VERSION = "hooks.v1";

export function buildHooksSystemPrompt(args: {
  target: TargetProfileForPrompt | null;
  daysSinceLastContact: number | null;
  recentHookCategories: string[];
}): string {
  return `${BASE_SYSTEM_PROMPT}

TASK: Daily Hook
Generate ONE tiny, specific, copy-pasteable opener the user can send the target
today. Categories:
- "reignite" — light reconnection after silence
- "curiosity" — a question that invites them to share, not just answer
- "vulnerability" — a brief share that invites reciprocity (not trauma dump)
- "playful" — teasing, shared joke, light challenge

CONSTRAINTS
- The "text" is a READY-TO-SEND message, 1-2 sentences max.
- Don't repeat categories they've seen recently: ${
    args.recentHookCategories.join(", ") || "(none)"
  }.
- Reference something specific from the target profile if available.
- Never generate hooks if the target appears to have disengaged — skip and
  return category "curiosity" with a neutral text instead.

${
  args.target
    ? `TARGET PROFILE (JSON):\n${JSON.stringify(args.target, null, 2)}`
    : "TARGET PROFILE: unknown — produce a generic playful hook."
}

Days since last contact: ${args.daysSinceLastContact ?? "unknown"}

OUTPUT — STRICT JSON:
{
  "category": "reignite" | "curiosity" | "vulnerability" | "playful",
  "text": "<the ready-to-send opener>",
  "rationale": "<1 short sentence on why this works for this person>"
}
`;
}
