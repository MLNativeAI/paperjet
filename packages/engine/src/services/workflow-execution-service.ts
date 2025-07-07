import { db } from "@paperjet/db";
import { file, workflow, workflowExecution } from "@paperjet/db/schema";
import { logger } from "@paperjet/shared";
import { and, desc, eq } from "drizzle-orm";
import type { Langfuse } from "langfuse";
import type {
  CategoriesConfiguration,
  WorkflowConfiguration,
  WorkflowRun,
} from "../types";
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

  async executeWorkflow(
    workflowId: string,
    workflowName: string,
    config: WorkflowConfiguration,
    userId: string,
    uploadedFile: File,
  ) {
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
    logger.info(
      { executionId, workflowId },
      "Starting data extraction for workflow execution",
    );
    const presignedUrl = await this.deps.s3.presign(filename);
    const extractionResult =
      await this.deps.extractionService.processExecutionFile(
        presignedUrl,
        config,
        {
          executionId,
          workflowId,
          userId,
        },
      );

    // Update execution with results
    await db
      .update(workflowExecution)
      .set({
        extractionResult: JSON.stringify(extractionResult),
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(workflowExecution.id, executionId));

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
  }

  async getWorkflowExecutions(
    workflowId: string,
    userId: string,
  ): Promise<WorkflowRun[]> {
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
        workflowName: workflow.name,
        categories: workflow.categories,
      })
      .from(workflowExecution)
      .leftJoin(file, eq(workflowExecution.fileId, file.id))
      .leftJoin(workflow, eq(workflowExecution.workflowId, workflow.id))
      .where(eq(workflowExecution.workflowId, workflowId))
      .orderBy(desc(workflowExecution.createdAt));

    const result = executions.map((execution) => ({
      ...execution,
      workflowName: execution.workflowName ?? "Unknown",
      categories: JSON.parse(
        execution.categories ?? "[]",
      ) as CategoriesConfiguration,
      filename: execution.filename
        ? execution.filename.split("/").pop() || "Unknown"
        : "Unknown",
    }));

    return result;
  }

  async getAllExecutions(userId: string): Promise<WorkflowRun[]> {
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
        workflowName: workflow.name,
        categories: workflow.categories,
      })
      .from(workflowExecution)
      .leftJoin(file, eq(workflowExecution.fileId, file.id))
      .leftJoin(workflow, eq(workflowExecution.workflowId, workflow.id))
      .where(eq(workflowExecution.ownerId, userId))
      .orderBy(desc(workflowExecution.createdAt));

    const result = executions.map((execution) => ({
      ...execution,
      workflowName: execution.workflowName ?? "Unknown",
      categories: JSON.parse(
        execution.categories ?? "[]",
      ) as CategoriesConfiguration,
      // Extract just the filename without the path
      filename: execution.filename
        ? execution.filename.split("/").pop() || "Unknown"
        : "Unknown",
    }));

    return result;
  }

  async getExecutionDetails(
    executionId: string,
    userId: string,
  ): Promise<WorkflowRun> {
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
        workflowName: workflow.name,
        categories: workflow.categories,
      })
      .from(workflowExecution)
      .leftJoin(file, eq(workflowExecution.fileId, file.id))
      .leftJoin(workflow, eq(workflowExecution.workflowId, workflow.id))
      .where(
        and(
          eq(workflowExecution.ownerId, userId),
          eq(workflowExecution.id, executionId),
        ),
      );

    if (!executionData) {
      throw new Error("Execution not found");
    }

    const result = {
      ...executionData,
      // Extract just the filename without the path
      filename: executionData.filename
        ? executionData.filename.split("/").pop() || "Unknown"
        : "Unknown",
      // Parse extractionResult from JSON string to object
      extractionResult: executionData.extractionResult
        ? JSON.parse(executionData.extractionResult)
        : null,
      workflowName: executionData.workflowName ?? "Unknown",
      categories: JSON.parse(
        executionData.categories ?? "[]",
      ) as CategoriesConfiguration,
    };
    return result;
  }

  async deleteExecution(executionId: string, userId: string) {
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
    await db
      .delete(workflowExecution)
      .where(eq(workflowExecution.id, executionId));
  }
}
