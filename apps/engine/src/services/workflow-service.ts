import { google } from "@ai-sdk/google";
import { db } from "@paperjet/db";
import { executionFile, file, workflow, workflowExecution, workflowFile } from "@paperjet/db/schema";
import {
    type DocumentAnalysis,
    documentAnalysisSchema,
    type ExtractionResult,
    type WorkflowConfiguration,
    workflowConfigurationSchema,
} from "@paperjet/db/types";
import { generateObject } from "ai";
import { desc, eq } from "drizzle-orm";
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

        return workflows.map((w) => ({
            ...w,
            configuration: JSON.parse(w.configuration),
        }));
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

        return {
            ...workflowData,
            configuration: JSON.parse(workflowData.configuration),
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
        const configuration = JSON.parse(workflowData.configuration);
        const hasFields = configuration.fields && configuration.fields.length > 0;
        const isAnalysisComplete = hasFields;

        return {
            analysisComplete: isAnalysisComplete,
            suggestedFields: configuration.fields || [],
            suggestedTables: configuration.tables || [],
            hasFields,
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

    async analyzeDocument(
        fileParam: File,
        userId: string,
    ): Promise<{
        fileId: string;
        analysis: DocumentAnalysis;
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

        // Get presigned URL for the file
        const presignedUrl = await this.deps.s3.presign(filename);

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
                            text: `You are a document analysis expert. Analyze this document and determine:
1. The type of document (invoice, receipt, contract, purchase order, bank statement, etc.)
2. Key fields that should be extracted from this type of document
3. Any tables or repeated data structures that should be extracted

IMPORTANT: For each field, provide a DETAILED description that explains:
- What specific information this field contains
- Where it's typically located on this type of document  
- Any formatting or characteristics that help identify it
- Examples of what the extracted value should look like

For each table, describe:
- What type of data rows it contains
- The business purpose of the table
- How to identify the table boundaries

The descriptions will be used by an AI system to locate and extract the actual data, so be precise and comprehensive.

Examples of good field descriptions:
- "merchant_name": "The business name or company name that issued this invoice, typically found at the top of the document in large text or letterhead"
- "total_amount": "The final amount due including all taxes and fees, usually labeled as 'Total', 'Amount Due', or 'Balance Due' and displayed prominently"
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

        return {
            fileId,
            analysis: object as DocumentAnalysis,
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

        // Start background analysis (don't await)
        this.analyzeWorkflowDocument(fileId, workflowId, filename).catch((error) => {
            console.error("Background analysis failed:", error);
        });

        return {
            workflowId,
            fileId,
        };
    }

    async extractDataFromDocument(
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
                let zodType;
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
                        let zodType;
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

    async executeWorkflow(workflowId: string, userId: string, uploadedFiles: File[]) {
        // Get workflow and verify ownership
        const [workflowData] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Parse workflow configuration
        const config = JSON.parse(workflowData.configuration) as WorkflowConfiguration;

        if (uploadedFiles.length === 0) {
            throw new Error("No files provided");
        }

        // Create execution record
        const executionId = crypto.randomUUID();
        await db.insert(workflowExecution).values({
            id: executionId,
            workflowId,
            status: "processing",
            startedAt: new Date(),
            createdAt: new Date(),
            ownerId: userId,
        });

        // Process each file
        const executionFiles = [];
        for (const uploadedFile of uploadedFiles) {
            try {
                // Save file to storage
                const fileId = crypto.randomUUID();
                const filename = `executions/${executionId}/${fileId}-${uploadedFile.name}`;

                await db.insert(file).values({
                    id: fileId,
                    filename,
                    createdAt: new Date(),
                    ownerId: userId,
                });

                const fileBuffer = await uploadedFile.arrayBuffer();
                await this.deps.s3.file(filename).write(fileBuffer);

                // Create execution file record
                const executionFileId = crypto.randomUUID();
                await db.insert(executionFile).values({
                    id: executionFileId,
                    executionId,
                    fileId,
                    status: "processing",
                    createdAt: new Date(),
                });

                // Extract data using existing extraction logic
                const extractionResult = await this.processExecutionFile(filename, config);

                // Update execution file with results
                await db
                    .update(executionFile)
                    .set({
                        extractionResult: JSON.stringify(extractionResult),
                        status: "completed",
                    })
                    .where(eq(executionFile.id, executionFileId));

                executionFiles.push({
                    executionFileId,
                    fileId,
                    filename: uploadedFile.name,
                    status: "completed",
                    extractionResult,
                });
            } catch (error) {
                console.error("File processing error:", error);

                // Update execution file with error
                const executionFileId = crypto.randomUUID();
                await db.insert(executionFile).values({
                    id: executionFileId,
                    executionId,
                    fileId: "error", // Placeholder for failed upload
                    status: "failed",
                    errorMessage: error instanceof Error ? error.message : "Unknown error",
                    createdAt: new Date(),
                });

                executionFiles.push({
                    executionFileId,
                    fileId: "error",
                    filename: uploadedFile.name,
                    status: "failed",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        // Update execution status
        const hasFailures = executionFiles.some((f) => f.status === "failed");
        const finalStatus = hasFailures ? "completed" : "completed"; // Even with some failures, mark as completed

        await db
            .update(workflowExecution)
            .set({
                status: finalStatus,
                completedAt: new Date(),
            })
            .where(eq(workflowExecution.id, executionId));

        return {
            executionId,
            status: finalStatus,
            files: executionFiles,
        };
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
                status: workflowExecution.status,
                startedAt: workflowExecution.startedAt,
                completedAt: workflowExecution.completedAt,
                createdAt: workflowExecution.createdAt,
            })
            .from(workflowExecution)
            .where(eq(workflowExecution.workflowId, workflowId))
            .orderBy(desc(workflowExecution.createdAt));

        // Get file details for each execution
        const executionsWithFiles = await Promise.all(
            executions.map(async (execution) => {
                const files = await db
                    .select({
                        id: executionFile.id,
                        fileId: executionFile.fileId,
                        extractionResult: executionFile.extractionResult,
                        status: executionFile.status,
                        errorMessage: executionFile.errorMessage,
                        createdAt: executionFile.createdAt,
                        filename: file.filename,
                    })
                    .from(executionFile)
                    .leftJoin(file, eq(executionFile.fileId, file.id))
                    .where(eq(executionFile.executionId, execution.id));

                return {
                    ...execution,
                    files,
                };
            }),
        );

        return executionsWithFiles;
    }

    async deleteWorkflow(workflowId: string, userId: string) {
        // Check if workflow exists and user owns it
        const [existingWorkflow] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!existingWorkflow || existingWorkflow.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Get all executions for this workflow to cascade delete
        const executions = await db
            .select({ id: workflowExecution.id })
            .from(workflowExecution)
            .where(eq(workflowExecution.workflowId, workflowId));

        // Delete execution files for each execution
        for (const execution of executions) {
            await db.delete(executionFile).where(eq(executionFile.executionId, execution.id));
        }

        // Delete workflow executions
        await db.delete(workflowExecution).where(eq(workflowExecution.workflowId, workflowId));

        // Delete workflow files
        await db.delete(workflowFile).where(eq(workflowFile.workflowId, workflowId));

        // Delete the workflow itself
        await db.delete(workflow).where(eq(workflow.id, workflowId));
    }

    private async analyzeWorkflowDocument(fileId: string, workflowId: string, filename: string) {
        try {
            // Get presigned URL for the file
            const presignedUrl = await this.deps.s3.presign(filename);

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
                                text: `You are a document analysis expert. Analyze this document and determine:
1. The type of document (invoice, receipt, contract, purchase order, bank statement, etc.)
2. Key fields that should be extracted from this type of document
3. Any tables or repeated data structures that should be extracted

IMPORTANT: For each field, provide a DETAILED description that explains:
- What specific information this field contains
- Where it's typically located on this type of document  
- Any formatting or characteristics that help identify it
- Examples of what the extracted value should look like

For each table, describe:
- What type of data rows it contains
- The business purpose of the table
- How to identify the table boundaries

The descriptions will be used by an AI system to locate and extract the actual data, so be precise and comprehensive.

Examples of good field descriptions:
- "merchant_name": "The business name or company name that issued this invoice, typically found at the top of the document in large text or letterhead"
- "total_amount": "The final amount due including all taxes and fees, usually labeled as 'Total', 'Amount Due', or 'Balance Due' and displayed prominently"
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

            const analysis = object as DocumentAnalysis;

            // Update workflow with analysis results
            const workflowName = `${analysis.documentType} Workflow`;

            await db
                .update(workflow)
                .set({
                    name: workflowName,
                    configuration: JSON.stringify({
                        fields: analysis.suggestedFields,
                        tables: analysis.suggestedTables,
                    }),
                    updatedAt: new Date(),
                })
                .where(eq(workflow.id, workflowId));

            console.log(`Analysis completed for workflow ${workflowId}`);
        } catch (error) {
            console.error(`Background analysis failed for workflow ${workflowId}:`, error);
        }
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
                let zodType;
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
                        let zodType;
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
