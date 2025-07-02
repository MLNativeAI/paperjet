import { google } from "@ai-sdk/google";
import type { ExtractionResult, WorkflowConfiguration } from "@paperjet/db/types";
import { generateObject } from "ai";
import type { Langfuse } from "langfuse";
import { z } from "zod";

export interface DocumentExtractionServiceDeps {
    langfuse: Langfuse;
}

export class DocumentExtractionService {
    constructor(private deps: DocumentExtractionServiceDeps) { }

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
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        // Create dynamic schema based on provided fields and tables
        const fieldSchemas = extractionConfig.fields
            .map((field) => {
                let zodType: string;
                switch (field.type) {
                    case "number":
                        zodType = "z.number().nullable()";
                        break;
                    case "date":
                        zodType = "z.string().nullable()"; // Date as ISO string
                        break;
                    case "currency":
                        zodType = "z.number().nullable()"; // Currency as number
                        break;
                    case "boolean":
                        zodType = "z.boolean().nullable()";
                        break;
                    default:
                        zodType = "z.string().nullable()";
                }
                return `"${field.name}": ${zodType}`;
            })
            .join(",\n  ");

        const tableSchemas = extractionConfig.tables
            .map((table) => {
                const columnSchemas = table.columns
                    .map((col) => {
                        let zodType: string;
                        switch (col.type) {
                            case "number":
                                zodType = "z.number().nullable()";
                                break;
                            case "date":
                                zodType = "z.string().nullable()";
                                break;
                            case "currency":
                                zodType = "z.number().nullable()";
                                break;
                            case "boolean":
                                zodType = "z.boolean().nullable()";
                                break;
                            default:
                                zodType = "z.string().nullable()";
                        }
                        return `"${col.name}": ${zodType}`;
                    })
                    .join(",\n    ");

                return `"${table.name}": z.array(z.object({\n    ${columnSchemas}\n  }))`;
            })
            .join(",\n  ");

        const fullSchema = `z.object({
  ${fieldSchemas}${fieldSchemas && tableSchemas ? ",\n  " : ""}${tableSchemas}
})`;

        // Build extraction prompt with field descriptions
        const fieldDescriptions = extractionConfig.fields
            .map((field) => `- ${field.name} (${field.type}): ${field.description}`)
            .join("\n");

        const tableDescriptions = extractionConfig.tables
            .map((table) => {
                const columnDescs = table.columns
                    .map((col) => `    - ${col.name} (${col.type}): ${col.description}`)
                    .join("\n");
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
            // Build dynamic schema object for generateObject
            const schemaObj = eval(`(${fullSchema})`);

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

    async processExecutionFile(
        presignedUrl: string,
        config: WorkflowConfiguration,
        metadata?: Record<string, unknown>,
    ): Promise<ExtractionResult> {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        // Build extraction schema
        const fieldSchemas = config.fields
            .map((field) => {
                let zodType: string;
                switch (field.type) {
                    case "number":
                        zodType = "z.number().nullable()";
                        break;
                    case "date":
                        zodType = "z.string().nullable()";
                        break;
                    case "currency":
                        zodType = "z.number().nullable()";
                        break;
                    case "boolean":
                        zodType = "z.boolean().nullable()";
                        break;
                    default:
                        zodType = "z.string().nullable()";
                }
                return `"${field.name}": ${zodType}`;
            })
            .join(",\n  ");

        const tableSchemas = config.tables
            .map((table) => {
                const columnSchemas = table.columns
                    .map((col) => {
                        let zodType: string;
                        switch (col.type) {
                            case "number":
                                zodType = "z.number().nullable()";
                                break;
                            case "date":
                                zodType = "z.string().nullable()";
                                break;
                            case "currency":
                                zodType = "z.number().nullable()";
                                break;
                            case "boolean":
                                zodType = "z.boolean().nullable()";
                                break;
                            default:
                                zodType = "z.string().nullable()";
                        }
                        return `"${col.name}": ${zodType}`;
                    })
                    .join(",\n    ");

                return `"${table.name}": z.array(z.object({\n    ${columnSchemas}\n  }))`;
            })
            .join(",\n  ");

        const fullSchema = `z.object({
  ${fieldSchemas}${fieldSchemas && tableSchemas ? ",\n  " : ""}${tableSchemas}
})`;

        const fieldDescriptions = config.fields
            .map((field) => `- ${field.name} (${field.type}): ${field.description}`)
            .join("\n");

        const tableDescriptions = config.tables
            .map((table) => {
                const columnDescs = table.columns
                    .map((col) => `    - ${col.name} (${col.type}): ${col.description}`)
                    .join("\n");
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
            const schemaObj = eval(`(${fullSchema})`);

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
