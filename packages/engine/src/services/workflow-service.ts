import { db } from "@paperjet/db";
import { file, workflow } from "@paperjet/db/schema";
import { logger } from "@paperjet/shared";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
    type CategoriesConfiguration,
    type ExtractionResult,
    type Workflow,
    type WorkflowConfiguration,
    workflowConfigurationSchema,
} from "../types";
import { generateId, ID_PREFIXES } from "../utils/id";
import { performCompleteAnalysis } from "./document-analysis-service";
import type { DocumentExtractionService } from "./document-extraction-service";
import type { WorkflowExecutionService } from "./workflow-execution-service";

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

        const emptyConfiguration: WorkflowConfiguration = { fields: [], tables: [] };

        const emptyResult: ExtractionResult = {
            fields: [],
            tables: [],
        };

        await db.insert(workflow).values({
            id: workflowId,
            name: workflowName,
            description: "",
            categories: "[]",
            configuration: JSON.stringify(emptyConfiguration),
            sampleData: JSON.stringify(emptyResult),
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

    async analyzeWorkflowDocument(workflowId: string, userId: string): Promise<void> {
        logger.info({ workflowId, userId }, "Starting workflow document analysis");

        // Get workflow and associated file
        const [workflowData] = await db
            .select({
                workflowId: workflow.id,
                workflowName: workflow.name,
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
        const presignedUrl = await this.deps.s3.presign(workflowData.filename);

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
                name: analysisResult.workflowName,
                description: analysisResult.description,
                categories: JSON.stringify(analysisResult.categories),
                configuration: JSON.stringify(configuration),
                status: "extracting",
                updatedAt: new Date(),
            })
            .where(eq(workflow.id, workflowId));

        logger.info("Workflow document analysis completed, triggering data extraction");

        await this.extractDataFromDocument(workflowId, workflowData.fileId, userId, configuration);
    }

    async extractDataFromDocument(
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
        const presignedUrl = await this.deps.s3.presign(fileRecord.filename);

        // Use the document extraction service
        const extractionResult = await this.deps.documentExtractionService.extractDataFromDocument(
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

    async getWorkflows(userId: string) {
        const workflows = await db.select().from(workflow).where(eq(workflow.ownerId, userId));

        const result = await Promise.all(
            workflows.map(async (w) => {
                const parsedConfig = await this.#parseWorkflowConfiguration(w.configuration);
                return {
                    ...w,
                    configuration: parsedConfig,
                    categories: JSON.parse(w.categories) as CategoriesConfiguration,
                    sampleData: w.sampleData ? (JSON.parse(w.sampleData) as ExtractionResult) : null,
                    sampleDataExtractedAt: w.sampleDataExtractedAt,
                };
            }),
        );

        return result;
    }

    async getWorkflow(workflowId: string, userId: string): Promise<Workflow> {
        const [workflowData] = await db.select().from(workflow).where(eq(workflow.id, workflowId));

        if (!workflowData || workflowData.ownerId !== userId) {
            throw new Error("Workflow not found");
        }

        const parsedConfig = await this.#parseWorkflowConfiguration(workflowData.configuration);

        return {
            ...workflowData,
            configuration: parsedConfig,
            categories: JSON.parse(workflowData.categories) as CategoriesConfiguration,
            sampleData: workflowData.sampleData ? (JSON.parse(workflowData.sampleData) as ExtractionResult) : null,
            sampleDataExtractedAt: workflowData.sampleDataExtractedAt,
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
        const result = await this.deps.workflowExecutionService.executeWorkflow(
            workflowId,
            workflowData.name,
            config,
            userId,
            uploadedFile,
        );

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
        await db.delete(file).where(eq(file.id, existingWorkflow.fileId));

        // Delete the workflow itself
        await db.delete(workflow).where(eq(workflow.id, workflowId));
    }

    async deleteExecution(executionId: string, userId: string) {
        return await this.deps.workflowExecutionService.deleteExecution(executionId, userId);
    }

    async updateWorkflowField(
        workflowId: string,
        fieldId: string,
        userId: string,
        updates: Partial<Omit<z.infer<typeof workflowConfigurationSchema.shape.fields.element>, "id">>,
    ) {
        // Get the workflow
        const workflowData = await this.getWorkflow(workflowId, userId);

        // Find and update the field
        const fieldIndex = workflowData.configuration.fields.findIndex((f) => f.id === fieldId);
        if (fieldIndex === -1) {
            throw new Error("Field not found");
        }

        // Update the field while preserving all required properties
        const currentField = workflowData.configuration.fields[fieldIndex];
        if (!currentField) {
            throw new Error("Field not found");
        }

        const updatedField = {
            ...currentField,
            ...updates,
            id: fieldId, // Ensure ID is never changed
            lastModified: new Date().toISOString(),
        };

        // Update the configuration
        const updatedConfiguration: WorkflowConfiguration = {
            ...workflowData.configuration,
            fields: [
                ...workflowData.configuration.fields.slice(0, fieldIndex),
                updatedField,
                ...workflowData.configuration.fields.slice(fieldIndex + 1),
            ],
        };

        await this.updateWorkflow(workflowId, userId, { configuration: updatedConfiguration });

        return updatedField;
    }

    async updateWorkflowTable(
        workflowId: string,
        tableId: string,
        userId: string,
        updates: Partial<Omit<z.infer<typeof workflowConfigurationSchema.shape.tables.element>, "id">>,
    ) {
        // Get the workflow
        const workflowData = await this.getWorkflow(workflowId, userId);

        // Find and update the table
        const tableIndex = workflowData.configuration.tables.findIndex((t) => t.id === tableId);
        if (tableIndex === -1) {
            throw new Error("Table not found");
        }

        // Update the table while preserving all required properties
        const currentTable = workflowData.configuration.tables[tableIndex];
        if (!currentTable) {
            throw new Error("Table not found");
        }

        // Handle columns update
        let updatedColumns = currentTable.columns;
        if (updates.columns) {
            updatedColumns = updates.columns.map((col, idx) => ({
                id: col.id || currentTable.columns[idx]?.id || generateId(ID_PREFIXES.column),
                name: col.name,
                description: col.description,
                type: col.type,
            }));
        }

        const updatedTable = {
            ...currentTable,
            ...updates,
            id: tableId, // Ensure ID is never changed
            columns: updatedColumns,
            lastModified: new Date().toISOString(),
        };

        // Update the configuration
        const updatedConfiguration: WorkflowConfiguration = {
            ...workflowData.configuration,
            tables: [
                ...workflowData.configuration.tables.slice(0, tableIndex),
                updatedTable,
                ...workflowData.configuration.tables.slice(tableIndex + 1),
            ],
        };

        await this.updateWorkflow(workflowId, userId, { configuration: updatedConfiguration });

        return updatedTable;
    }
}
