import {
  GenerateMessageLLMResponseSchema,
  type GenerateMessageLLMResponse,
  type TargetProfileForPrompt,
  type Tone,
} from "@/lib/schemas";
import type { LLMProvider } from "./providers";
import {
  buildGeneratorSystemPrompt,
  buildGeneratorUserMessage,
  GENERATOR_PROMPT_VERSION,
} from "./prompts/system/generator";
import { preCallModeration } from "./safety/moderation";

export type GenerateMessageServiceInput = {
  incomingMessage: string;
  tones: Tone[];
  target: TargetProfileForPrompt | null;
  userNote: string | null;
};

export type GenerateMessageServiceResult =
  | {
      ok: true;
      replies: GenerateMessageLLMResponse["replies"];
      telemetry: {
        provider: string;
        model: string;
        promptVersion: string;
        latencyMs: number;
        inputTokens: number;
        outputTokens: number;
      };
    }
  | {
      ok: false;
      reason: "moderation";
      message: string;
      reasons: string[];
    };

/**
 * Orchestration for the hero feature. The API module instantiates this
 * once at boot with a provider and calls `run` per request.
 *
 * Keeping this outside of the NestJS module tree means we can unit-test
 * the full Message Generator path without booting a Nest app.
 */
export class MessageGeneratorService {
  constructor(private readonly provider: LLMProvider) {}

  async run(
    input: GenerateMessageServiceInput,
  ): Promise<GenerateMessageServiceResult> {
    const mod = preCallModeration({
      incomingMessage: input.incomingMessage,
      userNote: input.userNote,
    });
    if (!mod.allow) {
      return {
        ok: false,
        reason: "moderation",
        message: mod.message ?? "Bu istek güvenlik kontrolüne takıldı.",
        reasons: mod.reasons,
      };
    }

    const system = buildGeneratorSystemPrompt({
      tones: input.tones,
      target: input.target,
      userNote: input.userNote,
    });

    const result = await this.provider.complete<GenerateMessageLLMResponse>({
      system,
      messages: [
        { role: "user", content: buildGeneratorUserMessage(input.incomingMessage) },
      ],
      schema: GenerateMessageLLMResponseSchema,
      temperature: 0.8,
      maxTokens: 600,
    });

    return {
      ok: true,
      replies: result.data.replies,
      telemetry: {
        provider: result.provider,
        model: result.model,
        promptVersion: GENERATOR_PROMPT_VERSION,
        latencyMs: result.latencyMs,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      },
    };
  }
}
