import { db } from "@paperjet/db";
import { file, workflow } from "@paperjet/db/schema";
import { logger } from "@paperjet/shared";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { generateId, ID_PREFIXES } from "../utils/id";
import { performCompleteAnalysis, } from "./document-analysis-service";
import type { DocumentExtractionService } from "./document-extraction-service";
import type { WorkflowExecutionService } from "./workflow-execution-service";
import type { DocumentAnalysis, WorkflowConfiguration } from "../types";

export interface WorkflowServiceDeps {
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

    async #parseWorkflowConfiguration(configuration: string): Promise<WorkflowConfiguration> {
        const parsedConfig = workflowConfigurationSchema.safeParse(JSON.parse(configuration));
        if (!parsedConfig.success) {
            logger.warn(parsedConfig.error, `Invalid workflow configuration: ${configuration}`);
        }
        return parsedConfig.data ?? { fields: [], tables: [] };
    }

    async createWorkflow(
        fileParam: File,
        userId: string,
    ): Promise<{
        workflowId: string;
        fileId: string;
    }> {
        logger.info(
            {
                userId,
                fileName: fileParam.name,
                fileSize: fileParam.size,
                fileType: fileParam.type,
            },
            "Creating new workflow from file",
        );

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
            description: "",
            categories: "[]",
            configuration: "{}",
            sampleData: "{}",
            fileId,
            status: "analyzing",
            ownerId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        logger.info(
            {
                workflowId,
                fileId,
                userId,
                workflowName,
            },
            "Workflow created successfully from file",
        );

        return {
            workflowId,
            fileId,
        };
    }

    async analyzeWorkflowDocument(
        workflowId: string,
        userId: string,
    ): Promise<{
        analysis: DocumentAnalysis;
    }> {
        logger.info({ workflowId, userId }, "Starting workflow document analysis");

        // Get workflow and associated file
        const [workflowData] = await db
            .select()
            .from(workflow)
            .where(eq(workflow.id, workflowId));

        if (!workflowData) {
            throw new Error("Workflow not found");
        }

        // Get presigned URL for the existing file
        const presignedUrl = await this.deps.s3.presign(workflowData.filename);

        // Use the document analysis service to perform complete analysis
        const analysisResult = await performCompleteAnalysis(presignedUrl);

        // Update workflow configuration with analysis results and set status to extracting
        const configuration: WorkflowConfiguration = {
            fields: analysisResult.suggestedFields,
            tables: analysisResult.suggestedTables,
        };

        await db
            .update(workflow)
            .set({
                name: analysisResult.workflowName,
                description: analysisResult.description,
                categories: JSON.stringify(analysisResult.categories),
                configuration: JSON.stringify(configuration),
                status: "extracting",
                updatedAt: new Date(),
            })
            .where(eq(workflow.id, workflowId));

        logger.info(
            "Workflow document analysis completed, triggering data extraction",
        );

        this.extractDataFromDocument(workflowId, workflowData.fileId, userId, configuration);

        return {
            analysis: analysisResult,
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
        logger.info(
            {
                workflowId,
                fileId,
                userId,
                fieldsCount: extractionConfig.fields.length,
                tablesCount: extractionConfig.tables.length,
            },
            "Starting data extraction from document",
        );
        // Get file from database
        const [fileRecord] = await db.select().from(file).where(eq(file.id, fileId));

        if (!fileRecord || fileRecord.ownerId !== userId) {
            throw new Error("File not found");
        }

        // Get presigned URL for the file
        const presignedUrl = await this.deps.s3.presign(fileRecord.filename);

        // Use the document extraction service
        const extractionResult = await this.deps.documentExtractionService.extractDataFromDocument(presignedUrl, extractionConfig, {
            workflowId,
            fileId,
            userId,
        });

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
        await db.insert(workflowSample).values({
            id: generateId(ID_PREFIXES.WORKFLOW_SAMPLE),
            workflowId,
            fileId,
            extractedData: JSON.stringify(extractionResult),
            createdAt: new Date(),
            updatedAt: new Date(),
            ownerId: userId,
        });

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

    async getWorkflows(userId: string) {
        const workflows = await db.select().from(workflow).where(eq(workflow.ownerId, userId));

        const result = await Promise.all(
            workflows.map(async (w) => {
                const parsedConfig = await this.#parseWorkflowConfiguration(w.configuration);
                return {
                    ...w,
                    configuration: parsedConfig,
                };
            }),
        );

        return result;
    }

    async getWorkflow(workflowId: string, userId: string): Promise<ValidWorkflow & { sample?: any }> {
        const [workflowData] = await db
            .select({
                id: workflow.id,
                name: workflow.name,
                description: workflow.description,
                configuration: workflow.configuration,
                status: workflow.status,
                ownerId: workflow.ownerId,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt,
                fileId: workflowFile.fileId,
                sampleData: workflowSample.extractedData,
            })
            .from(workflow)
            .leftJoin(workflowFile, eq(workflow.id, workflowFile.workflowId))
            .leftJoin(workflowSample, eq(workflow.id, workflowSample.workflowId))
            .where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        const parsedConfig = await this.#parseWorkflowConfiguration(workflowData.configuration);

        return {
            ...workflowData,
            configuration: parsedConfig,
            sample: workflowData.sampleData ? JSON.parse(workflowData.sampleData) : undefined,
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
            // When a name is provided, update status to active
            updateData.status = "active";
        }

        if (validatedData.configuration) {
            updateData.configuration = JSON.stringify(validatedData.configuration);
        }

        await db.update(workflow).set(updateData).where(eq(workflow.id, workflowId));
    }

    async getWorkflowWithEmbeddedSamples(workflowId: string, userId: string): Promise<ValidWorkflowWithSample> {
        const [workflowData] = await db
            .select({
                id: workflow.id,
                name: workflow.name,
                description: workflow.description,
                configuration: workflow.configuration,
                status: workflow.status,
                ownerId: workflow.ownerId,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt,
                fileId: workflowFile.fileId,
                sampleData: workflowSample.extractedData,
            })
            .from(workflow)
            .leftJoin(workflowFile, eq(workflow.id, workflowFile.workflowId))
            .leftJoin(workflowSample, eq(workflow.id, workflowSample.workflowId))
            .where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        const parsedConfig = await this.#parseWorkflowConfiguration(workflowData.configuration);
        let sampleData = null;

        try {
            sampleData = workflowData.sampleData ? JSON.parse(workflowData.sampleData) : null;
        } catch (error) {
            logger.warn({ workflowId, error }, "Failed to parse sample data");
        }

        // Embed sample values into field configuration
        const configurationWithSamples: WorkflowConfigurationWithSample = {
            ...parsedConfig,
            fields: parsedConfig.fields.map(field => {
                const sampleValue = sampleData?.fields?.find((f: any) => f.fieldName === field.name)?.value;
                return {
                    ...field,
                    sampleValue: sampleValue || null,
                };
            }),
        };

        return {
            ...workflowData,
            configuration: configurationWithSamples,
        };
    }

    async updateWorkflowBasicData(
        workflowId: string,
        userId: string,
        updates: {
            name: string;
            description?: string;
        },
    ) {
        const updateBasicDataSchema = z.object({
            name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
            description: z.string().optional(),
        });

        const validatedData = updateBasicDataSchema.parse(updates);

        // Check if workflow exists and user owns it
        const [existingWorkflow] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!existingWorkflow || existingWorkflow.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Update workflow basic data
        await db.update(workflow).set({
            name: validatedData.name,
            description: validatedData.description,
            updatedAt: new Date(),
        }).where(eq(workflow.id, workflowId));

        logger.info(
            {
                workflowId,
                userId,
                name: validatedData.name,
                hasDescription: !!validatedData.description,
            },
            "Workflow basic data updated",
        );
    }

    async getAnalysisStatus(workflowId: string, userId: string) {
        const [workflowData] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Check if analysis is complete by looking at configuration
        const parsedConfig = await this.#parseWorkflowConfiguration(workflowData.configuration);

        const configuration = parsedConfig;
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
        logger.info(
            {
                workflowId,
                userId,
                fileName: uploadedFile.name,
                fileSize: uploadedFile.size,
                fileType: uploadedFile.type,
            },
            "Starting workflow execution",
        );

        // Get workflow and verify ownership
        const [workflowData] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        // Parse workflow configuration
        const config = await this.#parseWorkflowConfiguration(workflowData.configuration);

        // Use the workflow execution service
        const result = await this.deps.workflowExecutionService.executeWorkflow(workflowId, workflowData.name, config, userId, uploadedFile);

        logger.info(
            {
                workflowId,
                executionId: result.executionId,
                status: result.status,
            },
            "Workflow execution completed via service",
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
