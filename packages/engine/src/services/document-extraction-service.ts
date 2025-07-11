import { logger } from "@paperjet/shared";
import { generateObject } from "../lib/ai-sdk-wrapper";
import type { ExtractionResult, WorkflowConfiguration } from "../types";
import { buildExtractionSchema } from "../utils/build-extraction-schema";

export async function runDocumentExtraction(
  presignedUrl: string,
  configuration: WorkflowConfiguration,
): Promise<ExtractionResult> {
  logger.info("Starting data extraction from document");
  // Build dynamic schema object based on provided fields and tables
  const schemaObj = buildExtractionSchema(configuration);

  // Build extraction prompt with field descriptions
  const fieldDescriptions = configuration.fields
    .map((field) => `- ${field.slug} (${field.type}): ${field.description}`)
    .join("\n");

  const tableDescriptions = configuration.tables
    .map((table) => {
      const columnDescs = table.columns.map((col) => `    - ${col.slug} (${col.type}): ${col.description}`).join("\n");
      return `- ${table.slug}: ${table.description}\n${columnDescs}`;
    })
    .join("\n");

  const prompt = `Extract the following information from this document:

FIELDS TO EXTRACT:
${fieldDescriptions}

${tableDescriptions ? `TABLES TO EXTRACT:\n${tableDescriptions}` : ""}

Instructions:
- Extract exact values as they appear in the document
- For currency fields, extract as numbers (remove currency symbols)
- For date fields, use ISO format (YYYY-MM-DD)
- For boolean fields, return true/false based on presence or checkmarks
- If a field is not found or unclear, return null
- For tables, extract all rows found
- Maintain data accuracy and completeness`;
  const result = await generateObject("document-extraction", {
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
            image: new URL(presignedUrl),
          },
        ],
      },
    ],
  });

  // Transform the result to match our extraction result schema
  const extractionResult: ExtractionResult = {
    fields: configuration.fields.map((field) => ({
      fieldName: field.slug,
      value: (result.object as any)[field.slug],
    })),
    tables: configuration.tables.map((table) => ({
      slug: table.slug,
      rows: ((result.object as any)[table.slug] || []).map((row: any) => ({
        values: row,
      })),
    })),
  };

  logger.info("Data extraction completed successfully");

  return extractionResult;
}