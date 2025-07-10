import type { LanguageModelUsage } from "ai";

export type IDReference = {
  userId?: string;
  workflowId?: string;
  executionId?: string;
};

export async function trackUsage(name: string, model: string, usage: LanguageModelUsage, idReference: IDReference) {
  console.log({ name, model, usage, idReference });
  // await db.insert(usageData).values({
  //   userId,
  //   model,
  //   inputTokens,
  //   outputTokens,
  //   totalTokens,
  //   totalCost,
  // });
}