import { db } from "@paperjet/db";
import { file, workflow, workflowFile } from "@paperjet/db/schema";
import { type DocumentAnalysis, type WorkflowConfiguration, workflowConfigurationSchema } from "@paperjet/db/types";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { generateId, ID_PREFIXES } from "../utils/id";
import type { DocumentAnalysisService } from "./document-analysis-service";
import type { DocumentExtractionService } from "./document-extraction-service";
import type { WorkflowExecutionService } from "./workflow-execution-service";

export interface WorkflowServiceDeps {
    documentAnalysisService: DocumentAnalysisService;
    documentExtractionService: DocumentExtractionService;
    workflowExecutionService: WorkflowExecutionService;
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

        const result = workflows.map((w) => {
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

        return result;
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

        const result = {
            ...workflowData,
            configuration: parsedConfig.data,
        };

        return result;
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

        const result = {
            analysisComplete: isAnalysisComplete,
            suggestedFields: configuration.fields || [],
            suggestedTables: configuration.tables || [],
            hasFields,
            documentType: configuration.documentType || "Unknown",
        };

        return result;
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
        const id = generateId(ID_PREFIXES.workflow);

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
                id: generateId(ID_PREFIXES.workflowFile),
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

        // Use the document analysis service to perform complete analysis
        const analysisResult = await this.deps.documentAnalysisService.performCompleteAnalysis(presignedUrl);

        // Update workflow configuration with analysis results
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
        const fileId = generateId(ID_PREFIXES.file);
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
        const workflowId = generateId(ID_PREFIXES.workflow);
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
            id: generateId(ID_PREFIXES.workflowFile),
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
    ) {
        // Get file from database
        const [fileRecord] = await db.select().from(file).where(eq(file.id, fileId));

        if (!fileRecord || fileRecord.ownerId !== userId) {
            throw new Error("File not found");
        }

        // Get presigned URL for the file
        const presignedUrl = await this.deps.s3.presign(fileRecord.filename);

        // Use the document extraction service
        const extractionResult = await this.deps.documentExtractionService.extractDataFromDocument(
            presignedUrl,
            extractionConfig,
            {
                workflowId,
                fileId,
                userId,
            },
        );

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

        const result = {
            fileId,
            filename: fileRecord.filename,
            presignedUrl,
        };

        return result;
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

        // Use the workflow execution service
        const result = await this.deps.workflowExecutionService.executeWorkflow(
            workflowId,
            workflowData.name,
            config,
            userId,
            uploadedFile,
        );

        return result;
    }

    async getWorkflowExecutions(workflowId: string, userId: string) {
        return await this.deps.workflowExecutionService.getWorkflowExecutions(workflowId, userId);
    }

    async getAllExecutions(userId: string) {
        return await this.deps.workflowExecutionService.getAllExecutions(userId);
    }

    async getExecutionDetails(executionId: string, userId: string) {
        return await this.deps.workflowExecutionService.getExecutionDetails(executionId, userId);
    }

    async deleteWorkflow(workflowId: string, userId: string) {
        // Check if workflow exists and user owns it
        const [existingWorkflow] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!existingWorkflow || existingWorkflow.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Delete workflow files
        await db.delete(workflowFile).where(eq(workflowFile.workflowId, workflowId));

        // Delete the workflow itself
        await db.delete(workflow).where(eq(workflow.id, workflowId));
    }

    async deleteExecution(executionId: string, userId: string) {
        return await this.deps.workflowExecutionService.deleteExecution(executionId, userId);
    }
}
