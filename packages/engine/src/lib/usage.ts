import { db } from "@paperjet/db";
import { usageData, usageModelPrice } from "@paperjet/db/schema";
import type { DbUsageModelPrice } from "@paperjet/db/types";
import { ExecutionContext } from "@paperjet/shared";
import type { LanguageModelUsage } from "ai";
import { desc, eq } from "drizzle-orm";

const cache = new Map<string, UsagePrice>();

type UsagePrice = {
  inputCost: number;
  outputCost: number;
};

async function getModelPrice(model: string): Promise<UsagePrice | null> {
  if (cache.has(model)) {
    return cache.get(model) ?? null;
  }

  const modelPrices: DbUsageModelPrice[] = await db
    .select()
    .from(usageModelPrice)
    .where(eq(usageModelPrice.model, model))
    .orderBy(desc(usageModelPrice.createdAt))
    .limit(1);

  if (modelPrices.length > 0 && modelPrices[0]) {

    const usagePrice = {
      inputCost: Number(modelPrices[0].inputCostPerMillionTokens),
      outputCost: Number(modelPrices[0].outputCostPerMillionTokens),
    };

    cache.set(model, usagePrice);
    return usagePrice;
  }

  return null;
}

const calculateCost = (usagePrice: UsagePrice, usage: LanguageModelUsage): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
} => {
  const inputCost = (usagePrice.inputCost * usage.promptTokens) / 1000000;
  const outputCost = (usagePrice.outputCost * usage.completionTokens) / 1000000;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
};

export async function trackUsage(name: string, model: string, usage: LanguageModelUsage, durationMs?: number) {
  const context = ExecutionContext.get();

  const modelPrice = await getModelPrice(model);

  const inputCost = usage.promptTokens && modelPrice ? calculateCost(modelPrice, usage).inputCost : 0;
  const outputCost = usage.completionTokens && modelPrice ? calculateCost(modelPrice, usage).outputCost : 0;
  const totalCost = inputCost + outputCost;

  await db.insert(usageData).values({
    name,
    model,
    inputTokens: usage.promptTokens || 0,
    inputCost,
    outputTokens: usage.completionTokens || 0,
    outputCost,
    totalTokens: usage.totalTokens || 0,
    totalCost,
    durationMs,
    userId: context?.userId,
    workflowId: context?.workflowId,
    executionId: context?.executionId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
