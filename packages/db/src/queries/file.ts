import { generateId, ID_PREFIXES } from "@paperjet/shared/id";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { file, workflowExecution } from "../schema";
import type { DbFile } from "../types/tables";

export async function createFile({
  fileName,
  filePath,
  fileType,
  mimeType,
  organizationId,
}: {
  fileName: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  organizationId: string;
}): Promise<DbFile> {
  const fileId = generateId(ID_PREFIXES.file);
  const result = await db
    .insert(file)
    .values({
      id: fileId,
      fileName: fileName,
      filePath: filePath,
      fileType: fileType,
      mimeType: mimeType,
      ownerId: organizationId,
      createdAt: new Date(),
    })
    .returning();
  if (!result[0]) {
    throw new Error("Failed to create file");
  }
  return result[0];
}

export async function getFileByWorkflowExecutionId({
  workflowExecutionId,
}: {
  workflowExecutionId: string;
}): Promise<{ filePath: string; ownerId: string; fileName: string }> {
  const result = await db
    .select({
      filePath: file.filePath,
      fileName: file.fileName,
      ownerId: file.ownerId,
    })
    .from(file)
    .leftJoin(workflowExecution, eq(workflowExecution.fileId, file.id))
    .where(eq(workflowExecution.id, workflowExecutionId))
    .limit(1);

  if (result.length === 0 || !result[0]?.filePath || !result[0]?.ownerId) {
    throw new Error("File is missing");
  }
  return result[0];
}

export async function getFile({
  workflowExecutionId,
  organizationId,
}: {
  workflowExecutionId: string;
  organizationId: string;
}) {
  const result = await db
    .select({
      filePath: file.filePath,
    })
    .from(file)
    .leftJoin(workflowExecution, eq(workflowExecution.fileId, file.id))
    .where(and(eq(workflowExecution.id, workflowExecutionId), eq(file.ownerId, organizationId)))
    .limit(1);

  if (result.length === 0 || !result[0]?.filePath) {
    throw new Error("File not found");
  }
  return result[0];
}

export async function getFileById({ fileId }: { fileId: string }): Promise<DbFile> {
  const result = await db.query.file.findFirst({
    where: eq(file.id, fileId),
  });
  if (!result) {
    throw new Error("File not found");
  }
  return result;
}
