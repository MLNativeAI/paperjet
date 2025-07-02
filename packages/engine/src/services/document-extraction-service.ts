import { google } from "@ai-sdk/google";
import type { ExtractionResult, WorkflowConfiguration } from "@paperjet/db/types";
import { logger } from "@paperjet/shared";
import { generateObject } from "ai";
import type { Langfuse } from "langfuse";
import { z } from "zod";

export interface DocumentExtractionServiceDeps {
    langfuse: Langfuse;
}

export class DocumentExtractionService {
    constructor(private deps: DocumentExtractionServiceDeps) {}

    async extractDataFromDocument(
        presignedUrl: string,
        extractionConfig: {
            fields: Array<{
                name: string;
                description: string;
                type: "text" | "number" | "date" | "currency" | "boolean";
            }>;
            tables: Array<{
                name: string;
                description: string;
                columns: Array<{
                    name: string;
                    description: string;
                    type: "text" | "number" | "date" | "currency" | "boolean";
                }>;
            }>;
        },
        metadata?: Record<string, unknown>,
    ): Promise<ExtractionResult> {
        logger.info(
            {
                fieldsCount: extractionConfig.fields.length,
                tablesCount: extractionConfig.tables.length,
                fields: extractionConfig.fields.map((f) => f.name),
                tables: extractionConfig.tables.map((t) => t.name),
            },
            "Starting data extraction from document",
        );
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        // Build dynamic schema object based on provided fields and tables
        const fieldSchemas: Record<string, any> = {};
        extractionConfig.fields.forEach((field) => {
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
        extractionConfig.tables.forEach((table) => {
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
            tableSchemas[table.name] = z.array(z.object(columnSchemas));
        });

        const schemaObj = z.object({ ...fieldSchemas, ...tableSchemas });

        // Build extraction prompt with field descriptions
        const fieldDescriptions = extractionConfig.fields.map((field) => `- ${field.name} (${field.type}): ${field.description}`).join("\n");

        const tableDescriptions = extractionConfig.tables
            .map((table) => {
                const columnDescs = table.columns.map((col) => `    - ${col.name} (${col.type}): ${col.description}`).join("\n");
                return `- ${table.name}: ${table.description}\n${columnDescs}`;
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

        // Create a trace for this extraction
        const trace = this.deps.langfuse.trace({
            name: "document-data-extraction",
            metadata: {
                operation: "data_extraction",
                model: "gemini-2.5-flash",
                fieldsCount: extractionConfig.fields.length,
                tablesCount: extractionConfig.tables.length,
                ...metadata,
            },
        });

        const generation = trace.generation({
            name: "extract-document-data",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
                extraction_config: extractionConfig,
            },
        });

        try {
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
                experimental_telemetry: {
                    isEnabled: true,
                    metadata: {
                        langfuseTraceId: trace.id,
                    },
                },
            });

            // Transform the result to match our extraction result schema
            const extractionResult: ExtractionResult = {
                fields: extractionConfig.fields.map((field) => ({
                    fieldName: field.name,
                    value: (object as any)[field.name],
                })),
                tables: extractionConfig.tables.map((table) => ({
                    tableName: table.name,
                    rows: ((object as any)[table.name] || []).map((row: any) => ({
                        values: row,
                    })),
                })),
            };

            generation.end({
                output: extractionResult,
            });

            trace.update({
                output: extractionResult,
            });

            logger.info(
                {
                    extractedFieldsCount: extractionResult.fields.length,
                    extractedTablesCount: extractionResult.tables.length,
                    fieldsExtracted: extractionResult.fields.map((f) => ({ name: f.fieldName, hasValue: f.value !== null })),
                },
                "Data extraction completed successfully",
            );

            return extractionResult;
        } catch (error) {
            generation.end({
                output: error,
            });

            trace.update({
                output: error,
            });

            throw error;
        }
    }

    async processExecutionFile(presignedUrl: string, config: WorkflowConfiguration, metadata?: Record<string, unknown>): Promise<ExtractionResult> {
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
            tableSchemas[table.name] = z.array(z.object(columnSchemas));
        });

        const schemaObj = z.object({ ...fieldSchemas, ...tableSchemas });

        const fieldDescriptions = config.fields.map((field) => `- ${field.name} (${field.type}): ${field.description}`).join("\n");

        const tableDescriptions = config.tables
            .map((table) => {
                const columnDescs = table.columns.map((col) => `    - ${col.name} (${col.type}): ${col.description}`).join("\n");
                return `- ${table.name}: ${table.description}\n${columnDescs}`;
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

        // Create a trace for this execution
        const trace = this.deps.langfuse.trace({
            name: "workflow-execution-extraction",
            metadata: {
                operation: "workflow_execution",
                model: "gemini-2.5-flash",
                fieldsCount: config.fields.length,
                tablesCount: config.tables.length,
                ...metadata,
            },
        });

        const generation = trace.generation({
            name: "process-execution-file",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
                workflow_config: config,
            },
        });

        try {
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
                experimental_telemetry: {
                    isEnabled: true,
                    metadata: {
                        langfuseTraceId: trace.id,
                    },
                },
            });

            // Transform result to match our extraction result schema
            const result: ExtractionResult = {
                fields: config.fields.map((field) => ({
                    fieldName: field.name,
                    value: (object as any)[field.name],
                })),
                tables: config.tables.map((table) => ({
                    tableName: table.name,
                    rows: ((object as any)[table.name] || []).map((row: any) => ({
                        values: row,
                    })),
                })),
            };

            generation.end({
                output: result,
            });

            trace.update({
                output: result,
            });

            logger.info(
                {
                    extractedFieldsCount: result.fields.length,
                    extractedTablesCount: result.tables.length,
                    fieldsExtracted: result.fields.map((f) => ({ name: f.fieldName, hasValue: f.value !== null })),
                },
                "Workflow execution file processing completed",
            );

            return result;
        } catch (error) {
            generation.end({
                output: error,
            });

            trace.update({
                output: error,
            });

            throw error;
        }
    }
}
