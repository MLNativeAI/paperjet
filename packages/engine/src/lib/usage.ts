import { db } from "@paperjet/db";
import { usageData } from "@paperjet/db/schema";
import { ExecutionContext } from "@paperjet/shared";
import type { LanguageModelUsage } from "ai";

export async function trackUsage(name: string, model: string, usage: LanguageModelUsage) {
  const context = ExecutionContext.get();

  console.log({ name, model, usage, context });
  await db.insert(usageData).values({
    id: crypto.randomUUID(),
    name,
    model,
    inputTokens: usage.promptTokens || 0,
    outputTokens: usage.completionTokens || 0,
    totalTokens: usage.totalTokens || 0,
    userId: context?.userId,
    workflowId: context?.workflowId,
    executionId: context?.executionId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
