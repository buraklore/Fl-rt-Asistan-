import type { TargetProfileForPrompt } from "@/lib/schemas";

/**
 * Inputs the context builder receives from the API layer.
 * The API is responsible for loading these from DB; this function
 * is pure — easy to unit-test with golden files.
 */
export type BuildContextInput = {
  target: TargetProfileForPrompt | null;
  /** Last N verbatim turns from this target's chat coach session. */
  recentTurns?: Array<{ role: "user" | "assistant"; content: string }>;
  /** Rolling summary of older turns. Kept in DB, refreshed async. */
  rollingSummary?: string | null;
  /** Semantic top-K from pgvector, pre-ranked. */
  semanticRecall?: Array<{ content: string; createdAt: Date }>;
};

export type BuildContextOutput = {
  /** Chunk to splice into the system prompt. */
  contextBlock: string;
  /** For telemetry: rough token estimate (4 chars ≈ 1 token). */
  estimatedTokens: number;
};

/**
 * Assemble the memory block injected into AI calls.
 *
 * Order matters: we go newest-first for recall (recent turns dominate),
 * oldest-first for summary (sets the scene), and wrap semantic matches
 * as "long-term memory" so the model treats them as reference, not
 * active conversation.
 */
export function buildContext(input: BuildContextInput): BuildContextOutput {
  const parts: string[] = [];

  if (input.rollingSummary) {
    parts.push(`BACKGROUND (summary of older history):\n${input.rollingSummary}`);
  }

  if (input.semanticRecall && input.semanticRecall.length > 0) {
    const recall = input.semanticRecall
      .map((m) => `- [${m.createdAt.toISOString().slice(0, 10)}] ${m.content}`)
      .join("\n");
    parts.push(`LONG-TERM MEMORY (relevant past messages):\n${recall}`);
  }

  if (input.recentTurns && input.recentTurns.length > 0) {
    const recent = input.recentTurns
      .map((t) => `${t.role === "user" ? "User" : "Coach"}: ${t.content}`)
      .join("\n");
    parts.push(`RECENT CONVERSATION:\n${recent}`);
  }

  const contextBlock = parts.length > 0 ? parts.join("\n\n") : "";
  return {
    contextBlock,
    estimatedTokens: Math.ceil(contextBlock.length / 4),
  };
}
