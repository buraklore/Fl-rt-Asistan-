import OpenAI from "openai";

export type StreamChunk = { type: "delta"; text: string };

export type StreamResult = {
  fullText: string;
  model: string;
  provider: "openai";
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
 * Streams a chat completion from OpenAI.
 * Anthropic was removed per user request (credit exhausted).
 */
export async function streamChat(
  args: StreamArgs,
  onChunk: (chunk: StreamChunk) => void,
): Promise<StreamResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error(
      "OPENAI_API_KEY ortam değişkeni tanımlı değil. Vercel → Settings → Environment Variables.",
    );
  }

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
}
