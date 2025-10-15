import z from "zod";
import type { RuntimeModelType } from "./configuration";

export const WorkflowExecutionStatus = z.enum(["Queued", "Processing", "Failed", "Completed"]);
export type WorkflowExecutionStatus = z.infer<typeof WorkflowExecutionStatus>;

export type WorkflowExecutionRow = {
  status: WorkflowExecutionStatus;
  id: string;
  createdAt: string;
  ownerId: string;
  workflowId: string;
  workflowName: string;
  fileId: string;
  fileName: string;
  jobId: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type ExtractedFieldData = {
  [fieldName: string]: string | number | Date | null;
};

export type ExtractedTableData = {
  [tableName: string]: Array<{
    [columnName: string]: string | number | Date | null;
  }>;
};

export type ExtractedObjectData = {
  fields?: ExtractedFieldData;
  tables?: ExtractedTableData;
};

export type ExtractedDataType = {
  [objectName: string]: ExtractedObjectData;
} | null;

export type WorkflowExecutionData = {
  status: WorkflowExecutionStatus;
  id: string;
  createdAt: string;
  ownerId: string;
  workflowId: string;
  workflowName: string;
  fileId: string;
  fileName: string;
  jobId: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  modelType: RuntimeModelType;
  extractedData: ExtractedDataType;
};

export type ExecutionStatusResponse = {
  id: string;
  status: WorkflowExecutionStatus;
  workflowId: string;
  fileId: string;
  jobId: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};
