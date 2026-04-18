import Anthropic from "@anthropic-ai/sdk";
import type { ZodSchema } from "zod";
import {
  LLMProvider,
  LLMCompleteArgs,
  LLMResult,
  LLMProviderError,
  LLMSchemaError,
} from "./index";

const DEFAULT_MODEL = "claude-opus-4-7";

export type AnthropicProviderOptions = {
  apiKey: string;
  defaultModel?: string;
};

/**
 * Claude provider. Handles:
 *   - system/messages translation
 *   - JSON-mode output when a schema is passed
 *   - retry-once on schema validation failure with a fix nudge
 *   - usage + latency telemetry
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private readonly client: Anthropic;
  private readonly defaultModel: string;

  constructor(opts: AnthropicProviderOptions) {
    this.client = new Anthropic({ apiKey: opts.apiKey });
    this.defaultModel = opts.defaultModel ?? DEFAULT_MODEL;
  }

  async complete<T = unknown>(args: LLMCompleteArgs): Promise<LLMResult<T>> {
    const model = args.model ?? this.defaultModel;
    const start = Date.now();

    try {
      const firstAttempt = await this.callModel(args, model);
      const parsed = this.tryParse<T>(firstAttempt, args.schema);

      if (parsed.ok) {
        return this.buildResult(parsed.value, firstAttempt, model, start);
      }

      // One retry with an explicit "fix the JSON" nudge. This pattern
      // catches ~95% of transient schema misses without doubling cost
      // on every call.
      const retry = await this.callModel(
        {
          ...args,
          messages: [
            ...args.messages,
            { role: "assistant", content: firstAttempt.text },
            {
              role: "user",
              content:
                "Your previous response did not match the required JSON schema. " +
                "Return ONLY the corrected JSON object. No prose, no markdown fences.",
            },
          ],
        },
        model,
      );

      const retryParsed = this.tryParse<T>(retry, args.schema);
      if (retryParsed.ok) {
        return this.buildResult(retryParsed.value, retry, model, start);
      }

      throw new LLMSchemaError(
        `Schema validation failed after retry: ${parsed.error}`,
        retry.text,
      );
    } catch (err) {
      if (err instanceof LLMSchemaError) throw err;
      throw new LLMProviderError(
        err instanceof Error ? err.message : "Unknown provider error",
        this.name,
        err,
      );
    }
  }

  private async callModel(
    args: LLMCompleteArgs,
    model: string,
  ): Promise<{
    text: string;
    inputTokens: number;
    outputTokens: number;
  }> {
    const system = args.schema
      ? `${args.system}\n\nIMPORTANT: Respond with a single valid JSON object only. No markdown, no prose, no code fences.`
      : args.system;

    const response = await this.client.messages.create({
      model,
      max_tokens: args.maxTokens ?? 1024,
      temperature: args.temperature ?? 0.7,
      system,
      messages: args.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }

  private tryParse<T>(
    result: { text: string },
    schema?: ZodSchema,
  ): { ok: true; value: T } | { ok: false; error: string } {
    if (!schema) return { ok: true, value: result.text as T };

    try {
      // Defensive: strip markdown fences if the model ignores instructions.
      const cleaned = result.text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const json = JSON.parse(cleaned);
      const parsed = schema.parse(json);
      return { ok: true, value: parsed as T };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "parse error",
      };
    }
  }

  private buildResult<T>(
    data: T,
    raw: { text: string; inputTokens: number; outputTokens: number },
    model: string,
    start: number,
  ): LLMResult<T> {
    return {
      data,
      raw: raw.text,
      usage: {
        inputTokens: raw.inputTokens,
        outputTokens: raw.outputTokens,
      },
      model,
      provider: this.name,
      latencyMs: Date.now() - start,
    };
  }
}
