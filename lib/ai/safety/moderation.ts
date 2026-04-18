/**
 * Pre-call moderation. Runs BEFORE the LLM call and may short-circuit
 * the entire request. Keep this fast and cheap.
 *
 * The philosophy: we don't try to be a comprehensive content classifier
 * here. We catch the obvious hard-block categories with keyword/pattern
 * matching, and delegate nuanced judgments to the system prompt's
 * hard safety rules. If a request is ambiguous, let the model see it
 * and refuse — models are better at nuance than regex.
 */

export type ModerationVerdict = {
  allow: boolean;
  reasons: string[];
  /** User-facing message when allow=false. */
  message: string | null;
};

const HARD_BLOCK_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  // Minors
  {
    pattern:
      /\b(\d{1,2})\s*(years?\s*old|yo|yaşında|yasinda)\b|\b(minor|underage|reşit\s*değil|13|14|15|16|17)\b.*\b(flirt|rizz|attract|seduce|sed[uü]kt|kandır|ikna\s*et|çıkmak)\b/i,
    reason: "minor_target",
  },
  // Explicit manipulation of someone who has disengaged
  {
    pattern:
      /\b(said\s*no|told\s*me\s*no|blocked\s*me|restraining|restraining\s*order|hayır\s*dedi|engelledi|yasaklama)\b/i,
    reason: "target_disengaged",
  },
];

export function preCallModeration(input: {
  incomingMessage: string;
  userNote?: string | null;
}): ModerationVerdict {
  const blob = [input.incomingMessage, input.userNote ?? ""].join(" ");
  const reasons: string[] = [];

  for (const { pattern, reason } of HARD_BLOCK_PATTERNS) {
    if (pattern.test(blob)) reasons.push(reason);
  }

  if (reasons.length > 0) {
    return {
      allow: false,
      reasons,
      message:
        "Bu istek RizzAI'nin güvenlik sınırlarına takıldı. Rızasız, reşit olmayan veya açıkça uzaklaşmış birine yönelik içerik üretmiyoruz.",
    };
  }

  return { allow: true, reasons: [], message: null };
}
