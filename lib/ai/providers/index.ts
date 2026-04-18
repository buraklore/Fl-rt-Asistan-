import type { ZodSchema } from "zod";

export type ChatTurn = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type LLMCompleteArgs = {
  system: string;
  messages: ChatTurn[];
  /** If set, provider is instructed to return valid JSON matching this schema. */
  schema?: ZodSchema;
  temperature?: number;
  maxTokens?: number;
  /** Logical model id; providers map this to their own ids. */
  model?: string;
};

export type LLMUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type LLMResult<T = unknown> = {
  /** Parsed & schema-validated output if a schema was provided, else raw string. */
  data: T;
  raw: string;
  usage: LLMUsage;
  model: string;
  provider: string;
  latencyMs: number;
};

export interface LLMProvider {
  readonly name: string;
  complete<T = unknown>(args: LLMCompleteArgs): Promise<LLMResult<T>>;
}

export class LLMProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "LLMProviderError";
  }
}

export class LLMSchemaError extends Error {
  constructor(
    message: string,
    public readonly raw: string,
  ) {
    super(message);
    this.name = "LLMSchemaError";
  }
}
