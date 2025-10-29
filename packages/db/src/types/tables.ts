import type {
  apikey,
  documentData,
  file,
  modelConfiguration,
  organization,
  runtimeConfiguration,
  workflow,
  workflowExecution,
} from "../schema";

export type DbFile = typeof file.$inferSelect;

export type DbOrganization = typeof organization.$inferSelect;

export type DbWorkflow = typeof workflow.$inferSelect;

export type DbWorkflowExecution = typeof workflowExecution.$inferSelect;

export type DbDocumentData = typeof documentData.$inferSelect;

export type DbModelConfiguration = typeof modelConfiguration.$inferSelect;

export type DbRuntimeConfiguration = typeof runtimeConfiguration.$inferSelect;

export type DbApiKey = typeof apikey.$inferSelect;
