import { db } from "@paperjet/db";
import { file, workflowExecution } from "@paperjet/db/schema";
import type { WorkflowConfiguration } from "@paperjet/db/types";
import { logger } from "@paperjet/shared";
import { desc, eq } from "drizzle-orm";
import type { Langfuse } from "langfuse";
import { generateId, ID_PREFIXES } from "../utils/id";
import type { DocumentExtractionService } from "./document-extraction-service";

export interface WorkflowExecutionServiceDeps {
    langfuse: Langfuse;
    extractionService: DocumentExtractionService;
    s3: {
        presign: (filename: string) => Promise<string>;
        file: (filename: string) => {
            write: (data: ArrayBuffer) => Promise<void>;
        };
    };
}

export class WorkflowExecutionService {
    constructor(private deps: WorkflowExecutionServiceDeps) {}

    async executeWorkflow(workflowId: string, workflowName: string, config: WorkflowConfiguration, userId: string, uploadedFile: File) {
        logger.info(
            {
                workflowId,
                workflowName,
                userId,
                fileName: uploadedFile.name,
                fileSize: uploadedFile.size,
                fileType: uploadedFile.type,
                fieldsCount: config.fields.length,
                tablesCount: config.tables.length,
            },
            "Starting workflow execution",
        );

        // Create execution record for single file
        const executionId = generateId(ID_PREFIXES.workflowExecution);
        const fileId = generateId(ID_PREFIXES.file);
        const filename = `executions/${executionId}/${uploadedFile.name}`;

        // Create a parent trace for the entire execution
        const executionTrace = this.deps.langfuse.trace({
            name: "workflow-execution",
            metadata: {
                workflowId,
                workflowName,
                executionId,
                fileId,
                filename: uploadedFile.name,
                userId,
                fileSize: uploadedFile.size,
                fileType: uploadedFile.type,
            },
            tags: ["workflow-execution"],
            userId,
        });

        try {
            // Save file to storage
            logger.info({ fileId, filename }, "Saving execution file to storage");
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

            // Extract data using extraction service
            logger.info({ executionId, workflowId }, "Starting data extraction for workflow execution");
            const presignedUrl = await this.deps.s3.presign(filename);
            const extractionResult = await this.deps.extractionService.processExecutionFile(presignedUrl, config, {
                executionId,
                workflowId,
                userId,
                langfuseTraceId: executionTrace.id,
            });

            // Update execution with results
            await db
                .update(workflowExecution)
                .set({
                    extractionResult: JSON.stringify(extractionResult),
                    status: "completed",
                    completedAt: new Date(),
                })
                .where(eq(workflowExecution.id, executionId));

            executionTrace.update({
                output: {
                    status: "completed",
                    extractionResult,
                },
            });

            logger.info(
                {
                    executionId,
                    workflowId,
                    extractedFieldsCount: extractionResult.fields.length,
                    extractedTablesCount: extractionResult.tables.length,
                },
                "Workflow execution completed successfully",
            );

            return {
                executionId,
                status: "completed",
                fileId,
                filename: uploadedFile.name,
                extractionResult,
            };
        } catch (error) {
            logger.error(
                {
                    executionId,
                    workflowId,
                    error: error instanceof Error ? error.message : "Unknown error",
                    userId,
                },
                "Workflow execution failed",
            );

            // Update execution with error
            await db
                .update(workflowExecution)
                .set({
                    status: "failed",
                    errorMessage: error instanceof Error ? error.message : "Unknown error",
                    completedAt: new Date(),
                })
                .where(eq(workflowExecution.id, executionId));

            executionTrace.update({
                output: {
                    status: "failed",
                    error: error instanceof Error ? error.message : "Unknown error",
                },
                level: "ERROR",
            });

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
        // Create a trace for this query
        const trace = this.deps.langfuse.trace({
            name: "get-workflow-executions",
            metadata: {
                workflowId,
                userId,
                operation: "list_executions",
            },
        });

        try {
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

            const result = executions.map((execution) => ({
                ...execution,
                filename: execution.filename ? execution.filename.split("/").pop() || "Unknown" : "Unknown",
            }));

            trace.update({
                output: {
                    executionsCount: result.length,
                },
            });

            return result;
        } catch (error) {
            trace.update({
                output: error,
                level: "ERROR",
            });

            throw error;
        }
    }

    async getAllExecutions(userId: string) {
        // Create a trace for this query
        const trace = this.deps.langfuse.trace({
            name: "get-all-executions",
            metadata: {
                userId,
                operation: "list_all_executions",
            },
        });

        try {
            // Get all executions for user with workflow names and file details
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
                .where(eq(workflowExecution.ownerId, userId))
                .orderBy(desc(workflowExecution.createdAt));

            const result = executions.map((execution) => ({
                ...execution,
                // Extract just the filename without the path
                filename: execution.filename ? execution.filename.split("/").pop() || "Unknown" : "Unknown",
            }));

            trace.update({
                output: {
                    executionsCount: result.length,
                },
            });

            return result;
        } catch (error) {
            trace.update({
                output: error,
                level: "ERROR",
            });

            throw error;
        }
    }

    async getExecutionDetails(executionId: string, userId: string) {
        // Create a trace for this query
        const trace = this.deps.langfuse.trace({
            name: "get-execution-details",
            metadata: {
                executionId,
                userId,
                operation: "get_execution_details",
            },
        });

        try {
            // Get the execution with file details
            const [executionData] = await db
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
                .where(eq(workflowExecution.id, executionId));

            if (!executionData) {
                throw new Error("Execution not found");
            }

            const result = {
                ...executionData,
                // Extract just the filename without the path
                filename: executionData.filename ? executionData.filename.split("/").pop() || "Unknown" : "Unknown",
                // Parse extractionResult from JSON string to object
                extractionResult: executionData.extractionResult ? JSON.parse(executionData.extractionResult) : null,
            };

            trace.update({
                output: {
                    executionFound: true,
                    status: result.status,
                },
            });

            return result;
        } catch (error) {
            trace.update({
                output: error,
                level: "ERROR",
            });

            throw error;
        }
    }

    async deleteExecution(executionId: string, userId: string) {
        // Create a trace for this operation
        const trace = this.deps.langfuse.trace({
            name: "delete-execution",
            metadata: {
                executionId,
                userId,
                operation: "delete_execution",
            },
        });

        try {
            // Get execution and verify user owns it
            const [executionData] = await db
                .select({
                    id: workflowExecution.id,
                    fileId: workflowExecution.fileId,
                })
                .from(workflowExecution)
                .where(eq(workflowExecution.id, executionId));

            if (!executionData) {
                throw new Error("Execution not found");
            }

            // Delete the execution
            await db.delete(workflowExecution).where(eq(workflowExecution.id, executionId));

            trace.update({
                output: {
                    deleted: true,
                },
            });
        } catch (error) {
            trace.update({
                output: error,
                level: "ERROR",
            });

            throw error;
        }
    }
}
