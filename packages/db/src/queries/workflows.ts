import { generateId, ID_PREFIXES } from "@paperjet/shared/id";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { workflow } from "../schema";
import type { RuntimeModelType } from "../types/configuration";
import type { DbWorkflow } from "../types/tables";
import type { WorkflowConfiguration } from "../types/workflow-config";

export async function updateWorkflow({
  workflowId,
  name,
  modelType,
  description,
  configuration,
  organizationId,
}: {
  workflowId: string;
  name: string;
  modelType: string;
  description: string;
  configuration: WorkflowConfiguration;
  organizationId: string;
}): Promise<void> {
  await db
    .update(workflow)
    .set({
      name: name,
      description: description,
      configuration: configuration,
      modelType: modelType,
    })
    .where(and(eq(workflow.id, workflowId), eq(workflow.ownerId, organizationId)));
}

export async function createWorkflow({
  name,
  description,
  configuration,
  modelType,
  organizationId,
  userId,
}: {
  name: string;
  description: string;
  configuration: WorkflowConfiguration;
  modelType: RuntimeModelType;
  organizationId: string;
  userId: string;
}): Promise<DbWorkflow> {
  const workflowId = generateId(ID_PREFIXES.workflow);
  const newWorkflowData = {
    id: workflowId,
    name: name,
    description: description || "",
    configuration: configuration,
    modelType: modelType,
    ownerId: organizationId,
    creatorId: userId,
  };

  const result = await db.insert(workflow).values(newWorkflowData).returning();
  if (!result[0]) {
    throw new Error("Failed to create new workflow");
  }
  return result[0];
}

export async function getWorkflow({ workflowId }: { workflowId: string }) {
  const workflowData = await db.query.workflow.findFirst({
    where: eq(workflow.id, workflowId),
  });
  if (!workflowData) {
    throw new Error("Workflow not found");
  }
  return {
    ...workflowData,
    modelType: workflowData.modelType as RuntimeModelType,
  };
}

export async function getWorkflowByOwner({
  workflowId,
  organizationId,
}: {
  workflowId: string;
  organizationId: string;
}): Promise<DbWorkflow> {
  const workflowData = await db.query.workflow.findFirst({
    where: and(eq(workflow.id, workflowId), eq(workflow.ownerId, organizationId)),
  });
  if (!workflowData) {
    throw new Error("Workflow not found");
  }
  return workflowData;
}

export async function getAllWorkflows({ organizationId }: { organizationId: string }): Promise<DbWorkflow[]> {
  const workflowData = await db.query.workflow.findMany({
    where: eq(workflow.ownerId, organizationId),
  });
  return workflowData;
}

export async function deleteWorkflow({ workflowId, organizationId }: { workflowId: string; organizationId: string }) {
  return await db.delete(workflow).where(and(eq(workflow.id, workflowId), eq(workflow.ownerId, organizationId)));
}
