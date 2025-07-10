import type { LanguageModelUsage } from "ai";

export async function trackUsage(name: string, model: string, usage: LanguageModelUsage) {
  console.log({ name, model, usage });
  // await db.insert(usageData).values({
  //   userId,
  //   model,
  //   inputTokens,
  //   outputTokens,
  //   totalTokens,
  //   totalCost,
  // });
}
