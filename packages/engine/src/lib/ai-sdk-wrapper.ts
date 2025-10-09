// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { createOpenAI } from "@ai-sdk/openai";
// import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
// import { logger } from "@paperjet/shared";
// import type { GenerateObjectResult, LanguageModel, ModelMessage } from "ai";
// import { generateObject as aiGenerateObject, generateText as aiGenerateText } from "ai";
// import type { z } from "zod";
// import { getValidModelConfig } from "../services/admin-service";
// import type { ModelConfigParams, ValidModelConfig } from "../types";
// import { trackUsage } from "./usage";
//
// export type GenerateObjectOptions<T extends z.ZodType> = {
//   schema: T;
//   messages: ModelMessage[];
//   model?: LanguageModel;
//   prompt?: string;
//   modelConfig?: ValidModelConfig;
// };
//
// export type GenerateTextOptions = {
//   messages: ModelMessage[];
//   model?: LanguageModel;
//   prompt?: string;
//   modelConfig?: ValidModelConfig;
// };
//
// // export async function generateText(operationName: string, options: GenerateTextOptions): Promise<string> {
// //   const startTime = Date.now();
// //   const modelConfig = (await getValidModelConfig());
// //   const model = (await getModelInstance(modelConfig));
// //
// //   try {
// //     const result = await aiGenerateText({
// //       model,
// //       messages: options.messages,
// //       prompt: options.prompt,
// //     });
// //
// //     const durationMs = Date.now() - startTime;
// //
// //     logger.debug(
// //       {
// //         operationName,
// //         modelId: model.modelId,
// //         durationMs,
// //         promptTokens: result.usage?.promptTokens,
// //         completionTokens: result.usage?.completionTokens,
// //         totalTokens: result.usage?.totalTokens,
// //       },
// //       "AI generation completed",
// //     );
// //
// //     await trackUsage(operationName, model.modelId, result.usage, durationMs);
// //
// //     return result.text;
// //   } catch (error) {
// //     const durationMs = Date.now() - startTime;
// //
// //     logger.error(
// //       {
// //         operationName,
// //         modelId: model.modelId,
// //         durationMs,
// //         error,
// //       },
// //       "AI generation failed",
// //     );
// //
// //     throw error;
// //   }
// // }
// //
// export async function generateObject<T extends z.ZodType>(
//   operationName: string,
//   options: GenerateObjectOptions<T>,
// ): Promise<GenerateObjectResult<z.infer<T>>> {
//   const startTime = Date.now();
//   // const modelConfig = options.modelConfig || (await getValidModelConfig());
//   // const model = options.model || (await getModelInstance(modelConfig));
//   //
//
//   const durationMs = Date.now() - startTime;
//   //
//   // logger.debug(
//   //   {
//   //     operationName,
//   //     modelId: model.modelId,
//   //     durationMs,
//   //     promptTokens: result.usage?.promptTokens,
//   //     completionTokens: result.usage?.completionTokens,
//   //     totalTokens: result.usage?.totalTokens,
//   //   },
//   //   "AI generation completed",
//   // );
//   //
//   // await trackUsage(operationName, model.modelId, result.usage, durationMs);
//
//   return result;
// }
// catch (error)
// {
//   const durationMs = Date.now() - startTime;
//
//   logger.error(
//     {
//       operationName,
//       // modelId: model.modelId,
//       durationMs,
//       error,
//     },
//     "AI generation failed",
//   );
//
//   throw error;
// }
// }
// function getToolMode(modelConfig: ModelConfigParams): "auto" | "json" | "tool" {
//   if (modelConfig.provider === "custom") {
//     return "json";
//   } else {
//     return "auto";
//   }
// }
