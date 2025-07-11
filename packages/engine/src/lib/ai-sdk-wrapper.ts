import { logger } from "@paperjet/shared";
import type { CoreMessage, GenerateObjectResult, LanguageModelV1, Message } from "ai";
import { generateObject as aiGenerateObject } from "ai";
import type { z } from "zod";
import { aiSdkModel } from "./model";
import { trackUsage } from "./usage";

export type GenerateObjectOptions<T extends z.ZodType> = {
  schema: T;
  messages: CoreMessage[] | Omit<Message, "id">[];
  model?: LanguageModelV1;
  prompt?: string;
};

export async function generateObject<T extends z.ZodType>(
  operationName: string,
  options: GenerateObjectOptions<T>,
): Promise<GenerateObjectResult<z.infer<T>>> {
  const startTime = Date.now();
  const model = options.model || aiSdkModel();

  try {
    logger.info({ operationName, modelId: model.modelId }, "Starting AI generation");

    const result = await aiGenerateObject({
      model,
      schema: options.schema,
      messages: options.messages,
      prompt: options.prompt,
    });

    const durationMs = Date.now() - startTime;

    logger.info(
      {
        operationName,
        modelId: model.modelId,
        durationMs,
        promptTokens: result.usage?.promptTokens,
        completionTokens: result.usage?.completionTokens,
        totalTokens: result.usage?.totalTokens,
      },
      "AI generation completed",
    );

    await trackUsage(operationName, model.modelId, result.usage, durationMs);

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error(
      {
        operationName,
        modelId: model.modelId,
        durationMs,
        error,
      },
      "AI generation failed",
    );

    throw error;
  }
}