import { createDocumentData, createDocumentPage, getFileByWorkflowExecutionId } from "@paperjet/db";
import { envVars, logger } from "@paperjet/shared";
import { s3Client } from "../lib/s3";
import type { OcrResult, PdfSplitResult } from "../types";

export async function splitPdfIntoImages(workflowExecutionId: string) {
  const fileData = await getFileByWorkflowExecutionId({ workflowExecutionId });
  const presignedUrl = s3Client.presign(fileData.filePath);

  const formData = new FormData();
  formData.set("presigned_url", presignedUrl);
  const response = await fetch(`${envVars.ML_SERVICE_URL}/split-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    logger.error(`Failed to split PDF: ${response.status}`);
    throw new Error("Split PDF has failed");
  }

  const splitResult = (await response.json()) as unknown as PdfSplitResult;
  const documentData = await createDocumentData({
    workflowExecutionId,
    organizationId: fileData.ownerId,
  });

  for (const page of splitResult.pages) {
    const pageFileName = `executions/${workflowExecutionId}/pages/page-${page.page_number}.png`;
    await s3Client.write(pageFileName, Buffer.from(page.image_data, "base64"));
    await createDocumentPage({ workflowExecutionId, pageNumber: page.page_number, documentDataId: documentData.id });
  }
}

export async function runNativeOcrOnDocument(workflowExecutionId: string) {
  const fileData = await getFileByWorkflowExecutionId({ workflowExecutionId });
  const presignedUrl = s3Client.presign(fileData.filePath);

  const formData = new FormData();
  formData.set("presigned_url", presignedUrl);
  const response = await fetch(`${envVars.ML_SERVICE_URL}/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    logger.error(`Failed to split PDF: ${response.status}`);
    throw new Error("Split PDF has failed");
  }

  const ocrResult = (await response.json()) as unknown as OcrResult;

  logger.debug(ocrResult, "ocrResult");

  await createDocumentData({
    workflowExecutionId,
    organizationId: fileData.ownerId,
    rawMarkdown: ocrResult.markdown,
  });
}
