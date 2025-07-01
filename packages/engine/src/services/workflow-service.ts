import { google } from "@ai-sdk/google";
import { db } from "@paperjet/db";
import { file, workflow, workflowExecution, workflowFile } from "@paperjet/db/schema";
import {
    type DocumentAnalysis,
    documentAnalysisSchema,
    type ExtractionResult,
    type WorkflowConfiguration,
    workflowConfigurationSchema,
} from "@paperjet/db/types";
import { generateObject } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export interface WorkflowServiceDeps {
    s3: {
        presign: (filename: string) => Promise<string>;
        file: (filename: string) => {
            write: (data: ArrayBuffer) => Promise<void>;
        };
    };
}

export class WorkflowService {
    constructor(private deps: WorkflowServiceDeps) {}

    async getWorkflows(userId: string) {
        const workflows = await db.select().from(workflow).where(eq(workflow.ownerId, userId));

        return workflows.map((w) => {
            const parsedConfig = workflowConfigurationSchema.safeParse(JSON.parse(w.configuration));
            if (!parsedConfig.success) {
                console.warn(`Invalid workflow configuration for workflow ${w.id}:`, parsedConfig.error);
                // Return a default configuration if parsing fails
                return {
                    ...w,
                    configuration: { fields: [], tables: [] },
                };
            }
            return {
                ...w,
                configuration: parsedConfig.data,
            };
        });
    }

    async getWorkflow(workflowId: string, userId: string) {
        const [workflowData] = await db
            .select({
                id: workflow.id,
                name: workflow.name,
                configuration: workflow.configuration,
                ownerId: workflow.ownerId,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt,
                fileId: workflowFile.fileId,
            })
            .from(workflow)
            .leftJoin(workflowFile, eq(workflow.id, workflowFile.workflowId))
            .where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        const parsedConfig = workflowConfigurationSchema.safeParse(JSON.parse(workflowData.configuration));
        if (!parsedConfig.success) {
            console.warn(`Invalid workflow configuration for workflow ${workflowId}:`, parsedConfig.error);
            // Return a default configuration if parsing fails
            return {
                ...workflowData,
                configuration: { fields: [], tables: [] },
            };
        }

        return {
            ...workflowData,
            configuration: parsedConfig.data,
        };
    }

    async updateWorkflow(
        workflowId: string,
        userId: string,
        updates: {
            name?: string;
            configuration?: WorkflowConfiguration;
        },
    ) {
        const updateWorkflowSchema = z.object({
            name: z.string().optional(),
            configuration: workflowConfigurationSchema.optional(),
        });

        const validatedData = updateWorkflowSchema.parse(updates);

        // Check if workflow exists and user owns it
        const [existingWorkflow] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!existingWorkflow || existingWorkflow.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Update workflow
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (validatedData.name) {
            updateData.name = validatedData.name;
        }

        if (validatedData.configuration) {
            updateData.configuration = JSON.stringify(validatedData.configuration);
        }

        await db.update(workflow).set(updateData).where(eq(workflow.id, workflowId));
    }

    async getAnalysisStatus(workflowId: string, userId: string) {
        const [workflowData] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Check if analysis is complete by looking at configuration
        const parsedConfig = workflowConfigurationSchema.safeParse(JSON.parse(workflowData.configuration));
        if (!parsedConfig.success) {
            console.warn(`Invalid workflow configuration for workflow ${workflowId}:`, parsedConfig.error);
            // Return default values if parsing fails
            return {
                analysisComplete: false,
                suggestedFields: [],
                suggestedTables: [],
                hasFields: false,
                documentType: "Unknown",
            };
        }

        const configuration = parsedConfig.data;
        const hasFields = configuration.fields && configuration.fields.length > 0;
        const isAnalysisComplete = hasFields;

        return {
            analysisComplete: isAnalysisComplete,
            suggestedFields: configuration.fields || [],
            suggestedTables: configuration.tables || [],
            hasFields,
            documentType: configuration.documentType || "Unknown",
        };
    }

    async createWorkflow(
        userId: string,
        data: {
            name: string;
            configuration: WorkflowConfiguration;
            fileId?: string;
        },
    ) {
        const createWorkflowSchema = z.object({
            name: z.string(),
            configuration: workflowConfigurationSchema,
            fileId: z.string().optional(),
        });

        const validatedData = createWorkflowSchema.parse(data);
        const id = crypto.randomUUID();

        await db.insert(workflow).values({
            id,
            name: validatedData.name,
            configuration: JSON.stringify(validatedData.configuration),
            ownerId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Link file to workflow if provided
        if (validatedData.fileId) {
            await db.insert(workflowFile).values({
                id: crypto.randomUUID(),
                workflowId: id,
                fileId: validatedData.fileId,
                createdAt: new Date(),
            });
        }

        return { id };
    }

    async analyzeWorkflowDocument(
        workflowId: string,
        userId: string,
    ): Promise<{
        analysis: DocumentAnalysis;
    }> {
        // Get workflow and associated file
        const [workflowData] = await db
            .select({
                workflowId: workflow.id,
                workflowName: workflow.name,
                fileId: workflowFile.fileId,
                filename: file.filename,
            })
            .from(workflow)
            .leftJoin(workflowFile, eq(workflow.id, workflowFile.workflowId))
            .leftJoin(file, eq(workflowFile.fileId, file.id))
            .where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.workflowId === null) {
            throw new Error("Workflow not found");
        }

        if (!workflowData.fileId || !workflowData.filename) {
            throw new Error("No file associated with this workflow");
        }

        // Get presigned URL for the existing file
        const presignedUrl = await this.deps.s3.presign(workflowData.filename);

        // Analyze document with Gemini Flash
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        const { object } = await generateObject({
            model,
            schema: documentAnalysisSchema,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this document and suggest relevant fields to extract.

For each field, provide:
- A clear, descriptive name (e.g., "invoice_number", "total_amount", "customer_name")
- The expected data type (text, number, date, currency, boolean)
- A detailed description that serves as instructions for AI extraction, including common label variations and formatting patterns

Focus on extracting:
1. **Identification fields**: Document numbers, IDs, reference codes
2. **Key entities**: Names, addresses, contact information
3. **Important dates**: Creation dates, due dates, effective dates
4. **Financial information**: Amounts, taxes, totals, currency values
5. **Status indicators**: Approval status, document state, flags
6. **Structured data**: Tables, line items, product lists

Examples of good field descriptions:
- "invoice_number": "The unique identifier for this invoice, often labeled as 'Invoice #', 'Invoice Number', 'Document Number', or similar, typically alphanumeric"
- "total_amount": "The final total amount due, usually labeled as 'Total', 'Amount Due', 'Grand Total', or 'Total Amount', excluding currency symbols"
- "invoice_date": "The date when the invoice was created or issued, typically labeled as 'Invoice Date', 'Date', or 'Issued' in MM/DD/YYYY or similar format"

Provide a structured analysis with practical, commonly needed information extraction focused on business processes.`,
                        },
                        {
                            type: "image",
                            image: new URL(presignedUrl),
                        },
                    ],
                },
            ],
        });

        // Update workflow configuration with analysis results
        const analysisResult = object as DocumentAnalysis;
        const configuration = {
            fields: analysisResult.suggestedFields || [],
            tables: analysisResult.suggestedTables || [],
            documentType: analysisResult.documentType || "Unknown",
        };

        await db
            .update(workflow)
            .set({
                configuration: JSON.stringify(configuration),
                updatedAt: new Date(),
            })
            .where(eq(workflow.id, workflowId));

        return {
            analysis: analysisResult,
        };
    }

    async createWorkflowFromFile(
        fileParam: File,
        userId: string,
    ): Promise<{
        workflowId: string;
        fileId: string;
    }> {
        // Save file first
        const fileId = crypto.randomUUID();
        const filename = `workflow-samples/${fileId}-${fileParam.name}`;

        await db.insert(file).values({
            id: fileId,
            filename,
            createdAt: new Date(),
            ownerId: userId,
        });

        const fileBuffer = await fileParam.arrayBuffer();
        await this.deps.s3.file(filename).write(fileBuffer);

        // Create workflow with empty configuration initially
        const workflowId = crypto.randomUUID();
        const workflowName = "New Workflow"; // Will be updated after analysis

        await db.insert(workflow).values({
            id: workflowId,
            name: workflowName,
            configuration: JSON.stringify({
                fields: [],
                tables: [],
            }),
            ownerId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Link file to workflow
        await db.insert(workflowFile).values({
            id: crypto.randomUUID(),
            workflowId,
            fileId,
            createdAt: new Date(),
        });

        return {
            workflowId,
            fileId,
        };
    }

    async extractDataFromDocument(
        workflowId: string,
        fileId: string,
        userId: string,
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
    ): Promise<{
        fileId: string;
        extractionResult: ExtractionResult;
    }> {
        const extractSchema = z.object({
            fields: z.array(
                z.object({
                    name: z.string(),
                    description: z.string(),
                    type: z.enum(["text", "number", "date", "currency", "boolean"]),
                }),
            ),
            tables: z.array(
                z.object({
                    name: z.string(),
                    description: z.string(),
                    columns: z.array(
                        z.object({
                            name: z.string(),
                            description: z.string(),
                            type: z.enum(["text", "number", "date", "currency", "boolean"]),
                        }),
                    ),
                }),
            ),
        });

        const validatedData = extractSchema.parse(extractionConfig);

        // Get file from database
        const [fileRecord] = await db.select().from(file).where(eq(file.id, fileId));

        if (!fileRecord || fileRecord.ownerId !== userId) {
            throw new Error("File not found");
        }

        // Get presigned URL for the file
        const presignedUrl = await this.deps.s3.presign(fileRecord.filename);

        // Create dynamic schema based on provided fields and tables
        const fieldSchemas = validatedData.fields
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
                return `${field.name}: ${zodType}`;
            })
            .join(",\n  ");

        const tableSchemas = validatedData.tables
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
                        return `${col.name}: ${zodType}`;
                    })
                    .join(",\n    ");

                return `${table.name}: z.array(z.object({\n    ${columnSchemas}\n  }))`;
            })
            .join(",\n  ");

        const fullSchema = `z.object({
  ${fieldSchemas}${fieldSchemas && tableSchemas ? ",\n  " : ""}${tableSchemas}
})`;

        // Build extraction prompt with field descriptions
        const fieldDescriptions = validatedData.fields
            .map((field) => `- ${field.name} (${field.type}): ${field.description}`)
            .join("\n");

        const tableDescriptions = validatedData.tables
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

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

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
        });

        // Transform the result to match our extraction result schema
        const extractionResult: ExtractionResult = {
            fields: validatedData.fields.map((field) => ({
                fieldName: field.name,
                value: (object as any)[field.name],
                confidence: 0.9, // Default confidence, could be enhanced
            })),
            tables: validatedData.tables.map((table) => ({
                tableName: table.name,
                rows: ((object as any)[table.name] || []).map((row: any) => ({
                    values: row,
                })),
                confidence: 0.9,
            })),
        };

        return {
            fileId,
            extractionResult,
        };
    }

    async getDocumentForFile(fileId: string, userId: string) {
        // Get file from database
        const [fileRecord] = await db.select().from(file).where(eq(file.id, fileId));

        if (!fileRecord || fileRecord.ownerId !== userId) {
            throw new Error("File not found");
        }

        // Get presigned URL for the file
        const presignedUrl = await this.deps.s3.presign(fileRecord.filename);

        return {
            fileId,
            filename: fileRecord.filename,
            presignedUrl,
        };
    }

    async executeWorkflow(workflowId: string, userId: string, uploadedFile: File) {
        // Get workflow and verify ownership
        const [workflowData] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Parse workflow configuration
        const parsedConfig = workflowConfigurationSchema.safeParse(JSON.parse(workflowData.configuration));
        if (!parsedConfig.success) {
            throw new Error(`Invalid workflow configuration: ${parsedConfig.error.message}`);
        }
        const config = parsedConfig.data;

        // Create execution record for single file
        const executionId = crypto.randomUUID();
        const fileId = crypto.randomUUID();
        const filename = `executions/${executionId}/${uploadedFile.name}`;

        try {
            // Save file to storage
            await db.insert(file).values({
                id: fileId,
                filename,
                createdAt: new Date(),
                ownerId: userId,
            });

            const fileBuffer = await uploadedFile.arrayBuffer();
            await this.deps.s3.file(filename).write(fileBuffer);

            // Create execution record with file reference
            await db.insert(workflowExecution).values({
                id: executionId,
                workflowId,
                fileId,
                status: "processing",
                startedAt: new Date(),
                createdAt: new Date(),
                ownerId: userId,
            });

            // Extract data using existing extraction logic
            const extractionResult = await this.processExecutionFile(filename, config);

            // Update execution with results
            await db
                .update(workflowExecution)
                .set({
                    extractionResult: JSON.stringify(extractionResult),
                    status: "completed",
                    completedAt: new Date(),
                })
                .where(eq(workflowExecution.id, executionId));

            return {
                executionId,
                status: "completed",
                fileId,
                filename: uploadedFile.name,
                extractionResult,
            };
        } catch (error) {
            console.error("File processing error:", error);

            // Update execution with error
            await db
                .update(workflowExecution)
                .set({
                    status: "failed",
                    errorMessage: error instanceof Error ? error.message : "Unknown error",
                    completedAt: new Date(),
                })
                .where(eq(workflowExecution.id, executionId));

            return {
                executionId,
                status: "failed",
                fileId,
                filename: uploadedFile.name,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getWorkflowExecutions(workflowId: string, userId: string) {
        // Verify workflow ownership
        const [workflowData] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Get executions with file details
        const executions = await db
            .select({
                id: workflowExecution.id,
                workflowId: workflowExecution.workflowId,
                fileId: workflowExecution.fileId,
                status: workflowExecution.status,
                extractionResult: workflowExecution.extractionResult,
                errorMessage: workflowExecution.errorMessage,
                startedAt: workflowExecution.startedAt,
                completedAt: workflowExecution.completedAt,
                createdAt: workflowExecution.createdAt,
                filename: file.filename,
            })
            .from(workflowExecution)
            .leftJoin(file, eq(workflowExecution.fileId, file.id))
            .where(eq(workflowExecution.workflowId, workflowId))
            .orderBy(desc(workflowExecution.createdAt));

        return executions.map((execution) => ({
            ...execution,
            filename: execution.filename ? execution.filename.split("/").pop() || "Unknown" : "Unknown",
        }));
    }

    async getAllExecutions(userId: string) {
        // Get all executions for user with workflow names and file details
        const executions = await db
            .select({
                id: workflowExecution.id,
                workflowId: workflowExecution.workflowId,
                workflowName: workflow.name,
                fileId: workflowExecution.fileId,
                status: workflowExecution.status,
                extractionResult: workflowExecution.extractionResult,
                errorMessage: workflowExecution.errorMessage,
                startedAt: workflowExecution.startedAt,
                completedAt: workflowExecution.completedAt,
                createdAt: workflowExecution.createdAt,
                filename: file.filename,
            })
            .from(workflowExecution)
            .innerJoin(workflow, eq(workflowExecution.workflowId, workflow.id))
            .leftJoin(file, eq(workflowExecution.fileId, file.id))
            .where(eq(workflow.ownerId, userId))
            .orderBy(desc(workflowExecution.createdAt));

        return executions.map((execution) => ({
            ...execution,
            // Extract just the filename without the path
            filename: execution.filename ? execution.filename.split("/").pop() || "Unknown" : "Unknown",
        }));
    }

    async getExecutionDetails(executionId: string, userId: string) {
        // Get the execution with workflow and file details
        const [executionData] = await db
            .select({
                id: workflowExecution.id,
                workflowId: workflowExecution.workflowId,
                workflowName: workflow.name,
                fileId: workflowExecution.fileId,
                status: workflowExecution.status,
                extractionResult: workflowExecution.extractionResult,
                errorMessage: workflowExecution.errorMessage,
                startedAt: workflowExecution.startedAt,
                completedAt: workflowExecution.completedAt,
                createdAt: workflowExecution.createdAt,
                filename: file.filename,
            })
            .from(workflowExecution)
            .innerJoin(workflow, eq(workflowExecution.workflowId, workflow.id))
            .leftJoin(file, eq(workflowExecution.fileId, file.id))
            .where(eq(workflowExecution.id, executionId));

        if (!executionData || executionData.workflowId === null) {
            throw new Error("Execution not found");
        }

        // Verify the workflow belongs to the user
        const [workflowData] = await db
            .select({ ownerId: workflow.ownerId })
            .from(workflow)
            .where(eq(workflow.id, executionData.workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Execution not found");
        }

        return {
            ...executionData,
            // Extract just the filename without the path
            filename: executionData.filename ? executionData.filename.split("/").pop() || "Unknown" : "Unknown",
            // Parse extractionResult from JSON string to object
            extractionResult: executionData.extractionResult ? JSON.parse(executionData.extractionResult) : null,
        };
    }

    async deleteWorkflow(workflowId: string, userId: string) {
        // Check if workflow exists and user owns it
        const [existingWorkflow] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!existingWorkflow || existingWorkflow.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Delete workflow executions (cascade will handle file references)
        await db.delete(workflowExecution).where(eq(workflowExecution.workflowId, workflowId));

        // Delete workflow files
        await db.delete(workflowFile).where(eq(workflowFile.workflowId, workflowId));

        // Delete the workflow itself
        await db.delete(workflow).where(eq(workflow.id, workflowId));
    }

    async deleteExecution(executionId: string, userId: string) {
        // Get execution and verify user owns the associated workflow
        const [executionData] = await db
            .select({
                id: workflowExecution.id,
                workflowId: workflowExecution.workflowId,
                fileId: workflowExecution.fileId,
            })
            .from(workflowExecution)
            .innerJoin(workflow, eq(workflowExecution.workflowId, workflow.id))
            .where(and(eq(workflowExecution.id, executionId), eq(workflow.ownerId, userId)));

        if (!executionData) {
            throw new Error("Execution not found");
        }

        // Delete the execution
        await db.delete(workflowExecution).where(eq(workflowExecution.id, executionId));
    }

    private async processExecutionFile(filename: string, config: WorkflowConfiguration): Promise<ExtractionResult> {
        const presignedUrl = await this.deps.s3.presign(filename);

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
                return `${field.name}: ${zodType}`;
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
                        return `${col.name}: ${zodType}`;
                    })
                    .join(",\n    ");

                return `${table.name}: z.array(z.object({\n    ${columnSchemas}\n  }))`;
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
        });

        // Transform result to match our extraction result schema
        return {
            fields: config.fields.map((field) => ({
                fieldName: field.name,
                value: (object as any)[field.name],
                confidence: 0.9,
            })),
            tables: config.tables.map((table) => ({
                tableName: table.name,
                rows: ((object as any)[table.name] || []).map((row: any) => ({
                    values: row,
                })),
                confidence: 0.9,
            })),
        };
    }
}
