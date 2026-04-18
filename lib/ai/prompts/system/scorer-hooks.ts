import type { TargetProfileForPrompt } from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

// ---------- Relationship Score ----------

export const SCORER_PROMPT_VERSION = "scorer.v1";

export function buildScorerSystemPrompt(args: {
  target: TargetProfileForPrompt | null;
  recentActivity: {
    generationsLast7Days: number;
    conflictsLast30Days: number;
    averageResponseLagHours: number | null;
  };
}): string {
  return `${BASE_SYSTEM_PROMPT}

TASK: Relationship Score
Compute a compatibility 0-100 with top-3 risks and top-3 strengths,
grounded in the target profile and recent activity signals.

SCORING RULES
- 80-100: strong alignment, consistent positive signals.
- 60-79:  compatible but meaningful mismatch in at least one dimension.
- 40-59:  workable with effort; noticeable friction or low certainty.
- 20-39:  structural incompatibility (attachment, values, life stage).
- 0-19:   misalignment severe enough to recommend stepping back.

- Risks must cite evidence from the profile or activity signals.
- Don't invent data. If unknown, confidence stays moderate.

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
  "summary": "<one sentence overall read>"
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
