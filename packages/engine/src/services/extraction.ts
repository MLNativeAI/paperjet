import {
  createDocumentData,
  getDocumentData,
  getFileByWorkflowExecutionId,
  getWorkflow,
  updateDocumentData,
} from "@paperjet/db";
import type { RuntimeModelType, WorkflowConfiguration } from "@paperjet/db/types";
import { logger } from "@paperjet/shared";
import { generateObject } from "ai";
import { s3Client } from "../lib/s3";
import { buildExtractionSchema } from "../utils/build-extraction-schema";
import { getModelForType } from "./admin/model-service";

function prepareSchema(configuration: WorkflowConfiguration) {
  // Build dynamic schema object based on provided fields and tables
  const schemaObj = buildExtractionSchema(configuration);

  // Build extraction prompt with structured object descriptions
  const objectDescriptions: string[] = [];

  configuration.objects.forEach((obj) => {
    let objDesc = `\n${obj.name.toUpperCase()}:`;

    if ("fields" in obj) {
      objDesc += `\n  Fields:`;
      obj.fields?.forEach((field) => {
        objDesc += `\n    - ${field.name} (${field.type})`;
      });
    }

    if ("tables" in obj) {
      objDesc += `\n  Tables:`;
      obj.tables?.forEach((table) => {
        objDesc += `\n    - ${table.name}: ${table.description || ""}`;
        table.columns.forEach((col) => {
          objDesc += `\n      - ${col.name} (${col.type})`;
        });
      });
    }

    objectDescriptions.push(objDesc);
  });

  return { schemaObj, objectDescriptions };
}

export async function extractDataFromImage(
  workflowId: string,
  workflowExecutionId: string,
  configuration: WorkflowConfiguration,
) {
  logger.debug(
    {
      workflowId,
      workflowExecutionId,
    },
    "Extracting data from image",
  );
  const fileData = await getFileByWorkflowExecutionId({ workflowExecutionId });
  const documentData = await createDocumentData({
    workflowExecutionId,
    organizationId: fileData.ownerId,
  });

  const fileBuffer = await s3Client.file(fileData.filePath).arrayBuffer();

  const extractionResult = await runImageExtraction(fileBuffer, configuration);
  await updateDocumentData({
    documentDataId: documentData.id,
    extractedData: extractionResult,
  });
  logger.debug({ workflowId, workflowExecutionId, result: extractionResult }, "Extraction completed");
}

export async function runImageExtraction(fileBuffer: ArrayBuffer, configuration: WorkflowConfiguration): Promise<any> {
  const { schemaObj, objectDescriptions } = prepareSchema(configuration);
  const prompt = `Extract the following information from this image:

EXTRACTION STRUCTURE:
${objectDescriptions.join("\n")}

Instructions:
- Extract exact values as they appear in the image
- For number fields, extract as numbers (remove currency symbols for currency)
- For date fields, use ISO format (YYYY-MM-DD)
- If a field is not found or unclear, return null
- For tables, extract all rows found
- Maintain data accuracy and completeness
- Structure the output to match the object hierarchy shown above`;
  const result = await generateObject({
    model: await getModelForType("accurate"),
    schema: schemaObj,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image",
            image: fileBuffer,
          },
        ],
      },
    ],
  });

  logger.info("Data extraction completed successfully");

  return result.object;
}

export async function extractDataFromMarkdown(
  workflowId: string,
  workflowExecutionId: string,
  configuration: WorkflowConfiguration,
  modelType: RuntimeModelType,
) {
  logger.debug(
    {
      workflowId,
      workflowExecutionId,
    },
    "Extracting data from markdown",
  );
  const documentData = await getDocumentData({
    workflowExecutionId,
  });
  if (!documentData || !documentData.rawMarkdown) {
    throw new Error("Fatal error, document data not found");
  }
  const workflowData = await getWorkflow({ workflowId });
  if (!workflowData) {
    throw new Error("Fatal error, workflow not found");
  }
  const extractionResult = await runDocumentExtraction(documentData.rawMarkdown, configuration, modelType);
  await updateDocumentData({
    documentDataId: documentData.id,
    extractedData: extractionResult,
  });
  logger.debug({ workflowId, workflowExecutionId, result: extractionResult }, "Extraction completed");
}

export async function runDocumentExtraction(
  markdownDocument: string,
  configuration: WorkflowConfiguration,
  modelType: RuntimeModelType,
): Promise<any> {
  const { schemaObj, objectDescriptions } = prepareSchema(configuration);
  const prompt = `Extract the following information from this document:

EXTRACTION STRUCTURE:
${objectDescriptions.join("\n")}

Instructions:
- Extract exact values as they appear in the document
- For number fields, extract as numbers (remove currency symbols for currency)
- For date fields, use ISO format (YYYY-MM-DD)
- If a field is not found or unclear, return null
- For tables, extract all rows found
- Maintain data accuracy and completeness
- Structure the output to match the object hierarchy shown above`;
  const result = await generateObject({
    model: await getModelForType(modelType),
    schema: schemaObj,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "text",
            text: markdownDocument,
          },
        ],
      },
    ],
  });

  logger.info("Data extraction completed successfully");

  return result.object;
}
