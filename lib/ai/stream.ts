import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type StreamChunk = { type: "delta"; text: string };

export type StreamResult = {
  fullText: string;
  model: string;
  provider: "anthropic" | "openai";
  inputTokens: number;
  outputTokens: number;
};

export type StreamArgs = {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  temperature?: number;
};

/**
 * Streams a chat completion from whichever LLM is configured & working.
 * Tries Anthropic first (better-feeling replies), falls back to OpenAI on
 * any error (credit exhausted, rate limit, timeout, etc).
 *
 * Yields delta chunks as they arrive, then returns a final summary on close.
 *
 * Usage:
 *   const result = await streamChat({...}, (chunk) => write(...));
 */
export async function streamChat(
  args: StreamArgs,
  onChunk: (chunk: StreamChunk) => void,
): Promise<StreamResult> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const preferOpenAI = process.env.LLM_PRIMARY_PROVIDER === "openai";

  const tryAnthropic = async (): Promise<StreamResult> => {
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY missing");
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const model = process.env.LLM_PRIMARY_MODEL ?? "claude-opus-4-7";

    const stream = await anthropic.messages.stream({
      model,
      max_tokens: args.maxTokens ?? 800,
      temperature: args.temperature ?? 0.7,
      system: args.system,
      messages: args.messages,
    });

    let full = "";
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        full += event.delta.text;
        onChunk({ type: "delta", text: event.delta.text });
      }
    }

    const final = await stream.finalMessage();
    return {
      fullText: full,
      model: final.model,
      provider: "anthropic",
      inputTokens: final.usage.input_tokens,
      outputTokens: final.usage.output_tokens,
    };
  };

  const tryOpenAI = async (): Promise<StreamResult> => {
    if (!openaiKey) throw new Error("OPENAI_API_KEY missing");
    const openai = new OpenAI({ apiKey: openaiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: args.system },
        ...args.messages,
      ],
      max_tokens: args.maxTokens ?? 800,
      temperature: args.temperature ?? 0.7,
      stream: true,
      stream_options: { include_usage: true },
    });

    let full = "";
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const event of stream) {
      const delta = event.choices[0]?.delta?.content;
      if (delta) {
        full += delta;
        onChunk({ type: "delta", text: delta });
      }
      if (event.usage) {
        inputTokens = event.usage.prompt_tokens ?? 0;
        outputTokens = event.usage.completion_tokens ?? 0;
      }
    }

    return {
      fullText: full,
      model,
      provider: "openai",
      inputTokens,
      outputTokens,
    };
  };

  // Try primary, fall back on any error.
  const primary = preferOpenAI ? tryOpenAI : tryAnthropic;
  const fallback = preferOpenAI ? tryAnthropic : tryOpenAI;

  try {
    return await primary();
  } catch (err) {
    console.warn(
      "[streamChat] primary failed, trying fallback:",
      err instanceof Error ? err.message : err,
    );
    return await fallback();
  }
}
