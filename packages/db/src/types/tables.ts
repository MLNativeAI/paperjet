import type {
  apikey,
  documentData,
  file,
  modelConfiguration,
  organization,
  runtimeConfiguration,
  usageData,
  usageModelPrice,
  workflow,
  workflowExecution,
} from "../schema";

export type DbFile = typeof file.$inferSelect;

export type DbOrganization = typeof organization.$inferSelect;

export type DbWorkflow = typeof workflow.$inferSelect;

export type DbWorkflowExecution = typeof workflowExecution.$inferSelect;

export type DbUsageModelPrice = typeof usageModelPrice.$inferSelect;

export type DbUsageData = typeof usageData.$inferSelect;

export type DbDocumentData = typeof documentData.$inferSelect;

export type DbModelConfiguration = typeof modelConfiguration.$inferSelect;

export type DbRuntimeConfiguration = typeof runtimeConfiguration.$inferSelect;

export type DbApiKey = typeof apikey.$inferSelect;
