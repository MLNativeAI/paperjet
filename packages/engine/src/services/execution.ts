import { getDocumentDataByOwner, getFile } from "@paperjet/db";
import type { ExtractedDataType } from "@paperjet/db/types";
import { envVars } from "@paperjet/shared";
import { s3Client } from "../lib/s3";
import { exportData } from "./export";

export async function exportExecution(workflowExecutionId: string, mode: "csv" | "json", organizationId: string) {
  const executionData = await getDocumentDataByOwner({ workflowExecutionId, organizationId });
  const data: ExtractedDataType = executionData.extractedData as unknown as ExtractedDataType;
  return exportData(data, mode, workflowExecutionId);
}

export async function getPresignedFileUrl(workflowExecutionId: string, organizationId: string) {
  const file = await getFile({ workflowExecutionId, organizationId });
  const presignedUrl = s3Client.presign(file?.filePath, {
    endpoint: envVars.S3_ENDPOINT,
  });

  return {
    documentUrl: presignedUrl,
  };
}
