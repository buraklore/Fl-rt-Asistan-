import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import type { LLMProvider, LLMCompleteArgs, LLMResult } from "./index";

/**
 * Hybrid provider: tries Anthropic first, falls back to OpenAI on any error.
 *
 * Env vars (any combination works):
 *   ANTHROPIC_API_KEY        → enables Claude
 *   OPENAI_API_KEY           → enables GPT fallback
 *   LLM_PRIMARY_PROVIDER     → "anthropic" (default) or "openai" to flip
 *   LLM_PRIMARY_MODEL        → optional Claude model override
 *   OPENAI_MODEL             → optional GPT model override (default gpt-4o-mini)
 *
 * Rationale: Anthropic hits common failure modes in production —
 *   - credit balance exhausted
 *   - rate limit
 *   - transient 5xx
 * Rather than crashing the user's request, we silently retry on OpenAI.
 * If only one key is configured, we use that one and surface its errors.
 */
export class HybridProvider implements LLMProvider {
  readonly name = "hybrid";
  private readonly primary: LLMProvider | null;
  private readonly fallback: LLMProvider | null;

  constructor() {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const preferOpenAI = process.env.LLM_PRIMARY_PROVIDER === "openai";

    const anthropic = anthropicKey
      ? new AnthropicProvider({
          apiKey: anthropicKey,
          defaultModel: process.env.LLM_PRIMARY_MODEL,
        })
      : null;

    const openai = openaiKey
      ? new OpenAIProvider({
          apiKey: openaiKey,
          defaultModel: process.env.OPENAI_MODEL,
        })
      : null;

    if (preferOpenAI) {
      this.primary = openai;
      this.fallback = anthropic;
    } else {
      this.primary = anthropic;
      this.fallback = openai;
    }
  }

  async complete<T = unknown>(args: LLMCompleteArgs): Promise<LLMResult<T>> {
    if (!this.primary && !this.fallback) {
      throw new Error(
        "Hiçbir LLM sağlayıcısı yapılandırılmamış. ANTHROPIC_API_KEY veya OPENAI_API_KEY env var ekle.",
      );
    }

    if (this.primary) {
      try {
        return await this.primary.complete<T>(args);
      } catch (err) {
        if (!this.fallback) throw err;
        console.warn(
          `[HybridProvider] Primary (${this.primary.name}) failed, falling back to ${this.fallback.name}:`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    // Either primary failed and we have a fallback, or primary wasn't configured.
    return await this.fallback!.complete<T>(args);
  }
}

/**
 * Single function every route should call to get an LLM. Returns the
 * configured hybrid provider — no manual provider-picking needed.
 */
export function getLLM(): LLMProvider {
  return new HybridProvider();
}
