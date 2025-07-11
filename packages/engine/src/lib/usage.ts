import { ExecutionContext } from "@paperjet/shared";
import type { LanguageModelUsage } from "ai";

export async function trackUsage(name: string, model: string, usage: LanguageModelUsage) {
  const context = ExecutionContext.get();

  console.log({ name, model, usage, context });
  // await db.insert(usageData).values({
  //   userId,
  //   model,
  //   inputTokens,
  //   outputTokens,
  //   totalTokens,
  //   totalCost,
  // });
}
