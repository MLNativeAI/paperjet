import { usageData, user } from "@paperjet/db/schema"
import type { UsageData } from "../types"
import { db } from "@paperjet/db"
import { eq } from "drizzle-orm"

export const getUsageData = async (): Promise<UsageData[]> => {
  const data = await db.select({
    id: usageData.id,
    name: usageData.name,
    model: usageData.model,
    userId: usageData.userId,
    userEmail: user.email,
    workflowId: usageData.workflowId,
    executionId: usageData.executionId,
    totalTokens: usageData.totalTokens,
    totalCost: usageData.totalCost,
    durationMs: usageData.durationMs,
    createdAt: usageData.createdAt
  }).from(usageData).leftJoin(user, eq(user.id, usageData.userId))

  const fixedData = data.map(usageEntry => {
    return {
      ...usageEntry,
      totalCost: Number(usageEntry.totalCost) ? Number(usageEntry.totalCost) : 0.0,
      durationMs: Number(usageEntry.durationMs) ? Number(usageEntry.durationMs) : 0.0,
      createdAt: new Date(usageEntry.createdAt)
    }
  })

  return fixedData
}

