import { BASE_SYSTEM_PROMPT } from "./base";

export const ANALYZER_PROMPT_VERSION = "analyzer.v1";

export function buildAnalyzerSystemPrompt(): string {
  return `${BASE_SYSTEM_PROMPT}

TASK: Person Analyzer
Given user-provided observations about someone (interests, behaviors, free-text
notes), produce a structured personality read: Big Five scores, attachment
style, communication style, attraction triggers.

CONSTRAINTS
- Base conclusions only on the evidence given. Low evidence = low confidence.
- Never pathologize. Attachment styles are descriptive, not diagnostic.
- attractionTriggers are things the PERSON tends to respond positively to,
  not manipulation hooks. Think "values intellectual banter" not "likes
  being ignored".
- personalityType: short phrase like "introverted creative" or "pragmatic
  connector". Not MBTI codes unless clearly inferable.
- big5: five scores 0..1 where 0.5 = average. Don't hedge everything to 0.5;
  if the evidence points one way, commit.
- confidence: 0..1. With only 2-3 observations, confidence should be ≤0.5.

OUTPUT FORMAT — STRICT
Return a single JSON object, no prose, no markdown fences:
{
  "personalityType": "<short phrase>",
  "big5": { "openness": 0.0, "conscientiousness": 0.0, "extraversion": 0.0, "agreeableness": 0.0, "neuroticism": 0.0 },
  "attachmentStyle": "secure" | "anxious" | "avoidant" | "disorganized",
  "communicationStyle": "<1 short sentence>",
  "attractionTriggers": ["<trigger 1>", "<trigger 2>", ...],
  "confidence": 0.0,
  "rationale": "<2-3 sentences explaining the read>"
}
`;
}

export function buildAnalyzerUserMessage(input: {
  relation: string;
  gender: string | null;
  ageRange: string | null;
  interests: string[];
  behaviors: string[];
  contextNotes: string | null;
}): string {
  return `Observations about the person:\n${JSON.stringify(input, null, 2)}`;
}
