import { usageData, user } from "@paperjet/db/schema"
import type { UsageData, UsageStats } from "../types"
import { db } from "@paperjet/db"
import { desc, eq } from "drizzle-orm"
import { subDays } from "date-fns"

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
  }).from(usageData).leftJoin(user, eq(user.id, usageData.userId)).orderBy(desc(usageData.createdAt))
  const fixedData = data.map(usageEntry => {
    return {
      ...usageEntry,
      totalCost: Number(usageEntry.totalCost) ? Number(usageEntry.totalCost) : 0.0,
      durationMs: Number(usageEntry.durationMs) ? Number(usageEntry.durationMs) : 0.0,
      createdAt: usageEntry.createdAt.toLocaleString()
    }
  })

  return fixedData
}

export const getUsageStats = (usageData: UsageData[]): UsageStats => {

  const timePeriod = subDays(new Date(), 30)
  const filteredUsageData = usageData.filter(ud => new Date(ud.createdAt) >= timePeriod)

  return {
    cost: filteredUsageData.reduce((acc, curr) => acc + curr.totalCost, 0),
    requests: filteredUsageData.length,
    executions: [...new Set(filteredUsageData.map(ud => ud.executionId).filter(ud => ud !== null))].length,
    users: [...new Set(filteredUsageData.map(ud => ud.userId).filter(ud => ud !== null))].length,
    timePeriod: '30days'
  }
}
