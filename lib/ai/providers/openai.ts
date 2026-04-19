import OpenAI from "openai";
import type { ZodSchema } from "zod";
import {
  LLMProvider,
  LLMCompleteArgs,
  LLMResult,
  LLMProviderError,
  LLMSchemaError,
} from "./index";

const DEFAULT_MODEL = "gpt-4o";

export type OpenAIProviderOptions = {
  apiKey: string;
  defaultModel?: string;
};

/**
 * OpenAI provider — conforms to LLMProvider interface.
 * Uses JSON mode (response_format) when a schema is passed, with a
 * one-retry pattern on parse failure.
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private readonly client: OpenAI;
  private readonly defaultModel: string;

  constructor(opts: OpenAIProviderOptions) {
    this.client = new OpenAI({ apiKey: opts.apiKey });
    this.defaultModel = opts.defaultModel ?? DEFAULT_MODEL;
  }

  async complete<T = unknown>(args: LLMCompleteArgs): Promise<LLMResult<T>> {
    const model = args.model ?? this.defaultModel;
    const start = Date.now();

    try {
      const first = await this.callModel(args, model);
      const parsed = this.tryParse<T>(first, args.schema);

      if (parsed.ok) return this.buildResult(parsed.value, first, model, start);

      const retry = await this.callModel(
        {
          ...args,
          messages: [
            ...args.messages,
            { role: "assistant", content: first.text },
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
    // OpenAI accepts a single messages array with role:'system' first.
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: args.system },
      ...args.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: args.maxTokens ?? 2048,
      temperature: args.temperature ?? 0.7,
      ...(args.schema ? { response_format: { type: "json_object" } } : {}),
    });

    const choice = response.choices[0];
    const text = choice?.message?.content ?? "";

    return {
      text,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    };
  }

  private tryParse<T>(
    result: { text: string },
    schema?: ZodSchema,
  ): { ok: true; value: T } | { ok: false; error: string } {
    if (!schema) return { ok: true, value: result.text as T };

    try {
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
