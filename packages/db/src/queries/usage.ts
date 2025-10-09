import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { usageData, usageModelPrice } from "../schema";
import type { DbUsageModelPrice } from "../types/tables";

export async function getUsagePrices({ model }: { model: string }) {
  const modelPrices: DbUsageModelPrice[] = await db
    .select()
    .from(usageModelPrice)
    .where(eq(usageModelPrice.model, model))
    .orderBy(desc(usageModelPrice.createdAt))
    .limit(1);
  return modelPrices;
}

export async function insertUsage({
  name,
  model,
  inputCost,
  outputCost,
  usage,
  totalCost,
  durationMs,
}: {
  name: string;
  model: string;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  durationMs?: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}) {
  await db.insert(usageData).values({
    name,
    model,
    inputTokens: usage.promptTokens || 0,
    inputCost: inputCost.toFixed(2),
    outputTokens: usage.completionTokens || 0,
    outputCost: outputCost.toFixed(2),
    totalTokens: usage.totalTokens || 0,
    totalCost: totalCost.toFixed(2),
    durationMs,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
//
// export const getUsageData = async (): Promise<UsageData[]> => {
//   const data = await db
//     .select({
//       id: usageData.id,
//       name: usageData.name,
//       model: usageData.model,
//       userId: usageData.userId,
//       userEmail: user.email,
//       workflowId: usageData.workflowId,
//       executionId: usageData.executionId,
//       totalTokens: usageData.totalTokens,
//       totalCost: usageData.totalCost,
//       durationMs: usageData.durationMs,
//       createdAt: usageData.createdAt,
//     })
//     .from(usageData)
//     .leftJoin(user, eq(user.id, usageData.userId))
//     .orderBy(desc(usageData.createdAt));
//   const fixedData = data.map((usageEntry) => {
//     return {
//       ...usageEntry,
//       totalCost: Number(usageEntry.totalCost) ? Number(usageEntry.totalCost) : 0.0,
//       durationMs: Number(usageEntry.durationMs) ? Number(usageEntry.durationMs) : 0.0,
//       createdAt: usageEntry.createdAt.toLocaleString(),
//     };
//   });
//
//   return fixedData;
// };
