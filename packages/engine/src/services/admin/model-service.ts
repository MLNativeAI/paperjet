import { createAnthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getModelConfigForType } from "@paperjet/db";
import type { RuntimeModelType } from "@paperjet/db/types";
import { logger } from "@paperjet/shared";
import { AISDKError, generateObject, type LanguageModel } from "ai";
import { createOllama } from "ollama-ai-provider-v2";
import z from "zod";
import type { ConnectionValidationResult, ModelConfigParams } from "../../types";

export async function validateConnection(modelConfig: ModelConfigParams): Promise<ConnectionValidationResult> {
  const modelInstance = await getModelInstance(modelConfig);

  try {
    const result = await generateObject({
      model: modelInstance,
      schema: z.object({
        answer: z.string(),
      }),
      prompt: `Respond with pong.`,
    });
    logger.info(result.object.answer, "Validation result:");

    if (result.object.answer.length > 0) {
      return {
        isValid: true,
        error: null,
      };
    } else {
      return {
        isValid: false,
        error: "The response did not match the expected output",
      };
    }
  } catch (error) {
    logger.error(error, "Invalid model configuration");
    if (error instanceof AISDKError) {
      return {
        isValid: false,
        error: error.message,
      };
    } else if (error instanceof Error) {
      return {
        isValid: false,
        error: error.message,
      };
    } else {
      return {
        isValid: false,
        error: "Unknown validation error",
      };
    }
  }
}

export async function getModelInstance(modelConfig: ModelConfigParams): Promise<LanguageModel> {
  switch (modelConfig.provider) {
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: modelConfig.providerApiKey,
      });
      return anthropic(modelConfig.modelName);
    }
    case "groq": {
      const groq = createGroq({
        apiKey: modelConfig.providerApiKey,
      });
      return groq(modelConfig.modelName);
    }
    case "azure": {
      const azure = createAzure({
        apiKey: modelConfig.providerApiKey,
      });
      return azure(modelConfig.modelName);
    }
    case "lmstudio": {
      const lmstudio = createOpenAICompatible({
        name: "lmstudio",
        baseURL: modelConfig.baseUrl || "",
        apiKey: modelConfig.providerApiKey || "",
      });
      return lmstudio(modelConfig.modelName);
    }
    case "ollama": {
      const ollama = createOllama({
        baseURL: modelConfig.baseUrl,
      });
      return ollama(modelConfig.modelName);
    }
    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: modelConfig.providerApiKey || "",
      });
      return google(modelConfig.modelName);
    }
    case "openai": {
      const openai = createOpenAI({
        apiKey: modelConfig.providerApiKey || "",
      });
      return openai(modelConfig.modelName);
    }
    case "openrouter": {
      const openrouter = createOpenRouter({
        apiKey: modelConfig.providerApiKey,
        extraBody: {
          provider: {
            // only: ["novita"],
            ignore: ["novita"],
          },
        },
      });
      return openrouter(modelConfig.modelName);
    }
    case "vllm": // same as custom
    case "custom": {
      const custom = createOpenAICompatible({
        baseURL: modelConfig.baseUrl || "",
        apiKey: modelConfig.providerApiKey || "",
        name: modelConfig.modelName,
        supportsStructuredOutputs: true,
      });
      return custom(modelConfig.modelName);
    }
    case "mistral": {
      const mistral = createMistral({
        apiKey: modelConfig.providerApiKey,
      });
      return mistral(modelConfig.modelName);
    }
    default: {
      throw new Error(`Unsupported provider: ${(modelConfig as any).provider}`);
    }
  }
}

export async function getModelForType(modelType: RuntimeModelType) {
  const dbModelConfig = await getModelConfigForType(modelType);
  const modelConfig: ModelConfigParams = {
    ...dbModelConfig,
    provider: dbModelConfig.provider as "google" | "openai" | "custom",
    providerApiKey: dbModelConfig.providerApiKey || "undefined",
    baseUrl: dbModelConfig.baseUrl || undefined,
  };
  return getModelInstance(modelConfig);
}
