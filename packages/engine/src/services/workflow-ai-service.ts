import { logger } from "@paperjet/shared";
import type { IDReference, WorkflowConfiguration } from "../types";
import { eq } from "drizzle-orm";
import { s3Client } from "../lib/s3";
import { db } from "@paperjet/db";
import { file, workflow } from "@paperjet/db/schema";
import { performCompleteAnalysis } from "./document-analysis-service";
import { runDocumentExtraction } from "./document-extraction-service";


  export async function analyzeWorkflowDocument(workflowId: string): Promise<void> {
    logger.info("Starting workflow document analysis");

    // Get workflow and associated file
    const [workflowData] = await db
      .select({
        workflowId: workflow.id,
        workflowName: workflow.slug,
        fileId: workflow.fileId,
        filename: file.filename,
      })
      .from(workflow)
      .leftJoin(file, eq(workflow.fileId, file.id))
      .where(eq(workflow.id, workflowId));

    if (!workflowData) {
      throw new Error("Workflow not found");
    }

    if (!workflowData.fileId || !workflowData.filename) {
      throw new Error("No file associated with this workflow");
    }
    // Get presigned URL for the existing file
    const presignedUrl = await s3Client.presign(workflowData.filename);

    // Use the document analysis service to perform complete analysis
    const analysisResult = await performCompleteAnalysis(presignedUrl);

    // Update workflow configuration with analysis results and set status to extracting
    const configuration: WorkflowConfiguration = {
      fields: analysisResult.fields,
      tables: analysisResult.tables,
    };

    await db
      .update(workflow)
      .set({
        slug: analysisResult.workflowName,
        description: analysisResult.description,
        categories: JSON.stringify(analysisResult.categories),
        configuration: JSON.stringify(configuration),
        status: "extracting",
        updatedAt: new Date(),
      })
      .where(eq(workflow.id, workflowId));

    logger.info("Workflow document analysis completed, triggering data extraction");

    await runDocumentExtraction(presignedUrl, configuration);
  }

  export async function extractDataFromDocument(
    workflowId: string,
    fileId: string,
    userId: string,
    configuration: WorkflowConfiguration,
  ) {
  logger.info("Starting data extraction from document");
  // Get file from database
  const [fileRecord] = await db.select().from(file).where(eq(file.id, fileId));

  if (!fileRecord || fileRecord.ownerId !== userId) {
    throw new Error("File not found");
  }

  // Get presigned URL for the file
  const presignedUrl = await s3Client.presign(fileRecord.filename);

  // Use the document extraction service
  const extractionResult = await runDocumentExtraction(
    presignedUrl,
    configuration,
  );

  logger.info(
    {
      workflowId,
      fileId,
      extractedFieldsCount: extractionResult.fields.length,
      extractedTablesCount: extractionResult.tables.length,
    },
    "Data extraction from document completed",
  );

  // Store sample data in workflow_sample table
  await db
    .update(workflow)
    .set({
      sampleData: JSON.stringify(extractionResult),
      sampleDataExtractedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(workflow.id, workflowId));

  // Update workflow status to configuring after extraction
  await db
    .update(workflow)
    .set({
      status: "configuring",
      updatedAt: new Date(),
    })
    .where(eq(workflow.id, workflowId));

  logger.info(
    {
      workflowId,
      fileId,
      extractedFieldsCount: extractionResult.fields.length,
      extractedTablesCount: extractionResult.tables.length,
    },
    "Sample data stored in workflow_sample table",
  );

  return {
    fileId,
    extractionResult,
  };
}