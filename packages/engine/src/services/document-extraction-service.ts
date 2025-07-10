import { google } from "@ai-sdk/google";
import { logger } from "@paperjet/shared";
import { generateObject } from "ai";
import { z } from "zod";
import { aiSdkModel } from "../lib/model";
import type { ExtractionResult, WorkflowConfiguration } from "../types";

export class DocumentExtractionService {
  async extractDataFromDocument(presignedUrl: string, configuration: WorkflowConfiguration): Promise<ExtractionResult> {
    logger.info("Starting data extraction from document");
    // Build dynamic schema object based on provided fields and tables
    // TODO: for now, we will not extract fields per category, we will add that later
    const fieldSchemas: Record<string, any> = {};
    configuration.fields.forEach((field) => {
      switch (field.type) {
        case "number":
          fieldSchemas[field.name] = z.number().nullable();
          break;
        case "date":
          fieldSchemas[field.name] = z.string().nullable(); // Date as ISO string
          break;
        case "currency":
          fieldSchemas[field.name] = z.number().nullable(); // Currency as number
          break;
        case "boolean":
          fieldSchemas[field.name] = z.boolean().nullable();
          break;
        default:
          fieldSchemas[field.name] = z.string().nullable();
      }
    });

    const tableSchemas: Record<string, any> = {};
    configuration.tables.forEach((table) => {
      const columnSchemas: Record<string, any> = {};
      table.columns.forEach((col) => {
        switch (col.type) {
          case "number":
            columnSchemas[col.name] = z.number().nullable();
            break;
          case "date":
            columnSchemas[col.name] = z.string().nullable();
            break;
          case "currency":
            columnSchemas[col.name] = z.number().nullable();
            break;
          case "boolean":
            columnSchemas[col.name] = z.boolean().nullable();
            break;
          default:
            columnSchemas[col.name] = z.string().nullable();
        }
      });
      tableSchemas[table.slug] = z.array(z.object(columnSchemas));
    });

    const schemaObj = z.object({ ...fieldSchemas, ...tableSchemas });

    // Build extraction prompt with field descriptions
    const fieldDescriptions = configuration.fields
      .map((field) => `- ${field.name} (${field.type}): ${field.description}`)
      .join("\n");

    const tableDescriptions = configuration.tables
      .map((table) => {
        const columnDescs = table.columns
          .map((col) => `    - ${col.name} (${col.type}): ${col.description}`)
          .join("\n");
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
    const { object } = await generateObject({
      model: aiSdkModel(),
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
        fieldName: field.name,
        value: (object as any)[field.name],
      })),
      tables: configuration.tables.map((table) => ({
        tableName: table.slug,
        rows: ((object as any)[table.slug] || []).map((row: any) => ({
          values: row,
        })),
      })),
    };

    logger.info("Data extraction completed successfully");

    return extractionResult;
  }

  async processExecutionFile(
    presignedUrl: string,
    config: WorkflowConfiguration,
    metadata?: Record<string, unknown>,
  ): Promise<ExtractionResult> {
    logger.info(
      {
        fieldsCount: config.fields.length,
        tablesCount: config.tables.length,
        workflowMetadata: metadata,
      },
      "Starting workflow execution file processing",
    );
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google API key not configured");
    }

    const model = google("gemini-2.5-flash");

    // Build dynamic schema object based on provided fields and tables
    const fieldSchemas: Record<string, any> = {};
    config.fields.forEach((field) => {
      switch (field.type) {
        case "number":
          fieldSchemas[field.name] = z.number().nullable();
          break;
        case "date":
          fieldSchemas[field.name] = z.string().nullable();
          break;
        case "currency":
          fieldSchemas[field.name] = z.number().nullable();
          break;
        case "boolean":
          fieldSchemas[field.name] = z.boolean().nullable();
          break;
        default:
          fieldSchemas[field.name] = z.string().nullable();
      }
    });

    const tableSchemas: Record<string, any> = {};
    config.tables.forEach((table) => {
      const columnSchemas: Record<string, any> = {};
      table.columns.forEach((col) => {
        switch (col.type) {
          case "number":
            columnSchemas[col.name] = z.number().nullable();
            break;
          case "date":
            columnSchemas[col.name] = z.string().nullable();
            break;
          case "currency":
            columnSchemas[col.name] = z.number().nullable();
            break;
          case "boolean":
            columnSchemas[col.name] = z.boolean().nullable();
            break;
          default:
            columnSchemas[col.name] = z.string().nullable();
        }
      });
      tableSchemas[table.slug] = z.array(z.object(columnSchemas));
    });

    const schemaObj = z.object({ ...fieldSchemas, ...tableSchemas });

    const fieldDescriptions = config.fields
      .map((field) => `- ${field.name} (${field.type}): ${field.description}`)
      .join("\n");

    const tableDescriptions = config.tables
      .map((table) => {
        const columnDescs = table.columns
          .map((col) => `    - ${col.name} (${col.type}): ${col.description}`)
          .join("\n");
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

    const { object } = await generateObject({
      model,
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

    // Transform result to match our extraction result schema
    const result: ExtractionResult = {
      fields: config.fields.map((field) => ({
        fieldName: field.name,
        value: (object as any)[field.name],
      })),
      tables: config.tables.map((table) => ({
        tableName: table.slug,
        rows: ((object as any)[table.slug] || []).map((row: any) => ({
          values: row,
        })),
      })),
    };

    logger.info(
      {
        extractedFieldsCount: result.fields.length,
        extractedTablesCount: result.tables.length,
        fieldsExtracted: result.fields.map((f) => ({
          name: f.fieldName,
          hasValue: f.value !== null,
        })),
      },
      "Workflow execution file processing completed",
    );

    return result;
  }
}
