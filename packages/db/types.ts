import type { file, usageData, usageModelPrice, workflow, workflowExecution } from "./schema";

export type FileData = typeof file.$inferSelect;

export type DbWorkflow = typeof workflow.$inferSelect;

export type DbWorkflowExecution = typeof workflowExecution.$inferSelect;

export type DbUsageModelPrice = typeof usageModelPrice.$inferSelect;

export type DbUsageData = typeof usageData.$inferSelect;