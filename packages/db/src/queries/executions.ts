import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { documentData, file, workflow, workflowExecution } from "../schema";
import {
  type ExecutionStatusResponse,
  type ExtractedDataType,
  type WorkflowExecutionData,
  type WorkflowExecutionRow,
  WorkflowExecutionStatus,
} from "../types/executions";
import { RuntimeModelType } from "../types/configuration";

export async function createWorkflowExecution({
  executionId,
  workflowId,
  fileId,
  organizationId,
  userId,
}: {
  executionId: string;
  workflowId: string;
  fileId: string;
  organizationId: string;
  userId: string;
}) {
  await db.insert(workflowExecution).values({
    id: executionId,
    workflowId,
    fileId,
    status: WorkflowExecutionStatus.enum.Queued,
    startedAt: new Date(),
    createdAt: new Date(),
    ownerId: organizationId,
    creatorId: userId,
  });
}

export async function updateExecutionStatus({
  status,
  workflowExecutionId,
  isCompleted,
}: {
  status: WorkflowExecutionStatus;
  isCompleted: boolean;
  workflowExecutionId: string;
}) {
  await db
    .update(workflowExecution)
    .set({ status: status, completedAt: isCompleted ? new Date() : null })
    .where(eq(workflowExecution.id, workflowExecutionId));
}

export async function updateExecutionJobId({
  workflowExecutionId,
  jobId,
}: {
  workflowExecutionId: string;
  jobId: string;
}) {
  await db
    .update(workflowExecution)
    .set({
      jobId,
    })
    .where(eq(workflowExecution.id, workflowExecutionId));
}
export async function getAllWorkflowExecutions({
  organizationId,
}: {
  organizationId: string;
}): Promise<WorkflowExecutionRow[]> {
  const executions = await db
    .select({
      id: workflowExecution.id,
      workflowId: workflowExecution.workflowId,
      workflowName: workflow.name,
      fileId: workflowExecution.fileId,
      fileName: file.fileName,
      jobId: workflowExecution.jobId,
      status: workflowExecution.status,
      errorMessage: workflowExecution.errorMessage,
      startedAt: workflowExecution.startedAt,
      completedAt: workflowExecution.completedAt,
      createdAt: workflowExecution.createdAt,
      ownerId: workflowExecution.ownerId,
    })
    .from(workflowExecution)
    .leftJoin(workflow, eq(workflowExecution.workflowId, workflow.id))
    .leftJoin(file, eq(workflowExecution.fileId, file.id))
    .where(eq(workflowExecution.ownerId, organizationId))
    .orderBy(desc(workflowExecution.createdAt));

  return executions.map((execution) => ({
    ...execution,
    workflowName: execution.workflowName || "Unknown Workflow",
    fileName: execution.fileName || "Unknown File",
    startedAt: execution.startedAt.toISOString(),
    completedAt: execution.completedAt?.toISOString() || null,
    createdAt: execution.createdAt.toISOString(),
  }));
}

export async function getWorkflowExecutionWithExtractedData({
  workflowExecutionId,
  organizationId,
}: {
  workflowExecutionId: string;
  organizationId: string;
}): Promise<WorkflowExecutionData> {
  const result = await db
    .select({
      id: workflowExecution.id,
      workflowId: workflowExecution.workflowId,
      workflowName: workflow.name,
      modelType: workflow.modelType,
      fileId: workflowExecution.fileId,
      fileName: file.fileName,
      jobId: workflowExecution.jobId,
      status: workflowExecution.status,
      errorMessage: workflowExecution.errorMessage,
      startedAt: workflowExecution.startedAt,
      completedAt: workflowExecution.completedAt,
      createdAt: workflowExecution.createdAt,
      ownerId: workflowExecution.ownerId,
      extractedData: documentData.extractedData,
    })
    .from(workflowExecution)
    .leftJoin(workflow, eq(workflowExecution.workflowId, workflow.id))
    .leftJoin(file, eq(workflowExecution.fileId, file.id))
    .leftJoin(documentData, eq(documentData.workflowExecutionId, workflowExecution.id))
    .where(and(eq(workflowExecution.id, workflowExecutionId), eq(workflowExecution.ownerId, organizationId)));

  const execution = result[0];
  if (!execution) {
    throw new Error("not found");
  }

  return {
    ...execution,
    modelType: (execution.modelType as unknown as RuntimeModelType) || "accurate",
    workflowName: execution.workflowName || "Unknown Workflow",
    fileName: execution.fileName || "Unknown File",
    startedAt: execution.startedAt.toISOString(),
    completedAt: execution.completedAt?.toISOString() || null,
    createdAt: execution.createdAt.toISOString(),
    extractedData: execution.extractedData as unknown as ExtractedDataType,
  };
}

export async function getWorkflowExecutionStatus({
  workflowExecutionId,
  organizationId,
}: {
  workflowExecutionId: string;
  organizationId: string;
}): Promise<ExecutionStatusResponse> {
  const result = await db
    .select({
      id: workflowExecution.id,
      workflowId: workflowExecution.workflowId,
      fileId: workflowExecution.fileId,
      jobId: workflowExecution.jobId,
      status: workflowExecution.status,
      errorMessage: workflowExecution.errorMessage,
      startedAt: workflowExecution.startedAt,
      completedAt: workflowExecution.completedAt,
      createdAt: workflowExecution.createdAt,
    })
    .from(workflowExecution)
    .where(and(eq(workflowExecution.id, workflowExecutionId), eq(workflowExecution.ownerId, organizationId)));

  const execution = result[0];
  if (!execution) {
    throw new Error("not found");
  }

  return {
    ...execution,
    startedAt: execution.startedAt.toISOString(),
    completedAt: execution.completedAt?.toISOString() || null,
  };
}
