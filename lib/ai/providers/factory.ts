import { OpenAIProvider } from "./openai";
import type { LLMProvider, LLMCompleteArgs, LLMResult } from "./index";

/**
 * Thin wrapper around OpenAIProvider — single source of LLM for the app.
 *
 * Anthropic was removed because the account's credit was exhausted and
 * the user explicitly requested OpenAI-only. If we ever add a second
 * provider, bring back the hybrid pattern (see git history).
 *
 * Env:
 *   OPENAI_API_KEY   (required)
 *   OPENAI_MODEL     (optional, defaults to gpt-4o-mini)
 */
export class HybridProvider implements LLMProvider {
  readonly name = "openai-only";
  private readonly provider: LLMProvider;

  constructor() {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error(
        "OPENAI_API_KEY ortam değişkeni tanımlı değil. Vercel → Settings → Environment Variables.",
      );
    }
    this.provider = new OpenAIProvider({
      apiKey: openaiKey,
      defaultModel: process.env.OPENAI_MODEL,
    });
  }

  async complete<T = unknown>(args: LLMCompleteArgs): Promise<LLMResult<T>> {
    return this.provider.complete<T>(args);
  }
}

/**
 * Every route calls this. Returns the configured OpenAI provider.
 */
export function getLLM(): LLMProvider {
  return new HybridProvider();
}
