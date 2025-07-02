import { zValidator } from "@hono/zod-validator";
import { DocumentAnalysisService, DocumentExtractionService, WorkflowExecutionService, WorkflowService } from "@paperjet/engine";
import { Hono } from "hono";
import { Langfuse } from "langfuse";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { s3 } from "@/lib/s3";
import { executionIdSchema, workflowIdSchema } from "@/lib/validation";

const app = new Hono();

// Initialize Langfuse client
const langfuse = new Langfuse({
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
});

// Initialize services with dependencies
const documentAnalysisService = new DocumentAnalysisService({ langfuse });
const documentExtractionService = new DocumentExtractionService({ langfuse });
const workflowExecutionService = new WorkflowExecutionService({
    langfuse,
    extractionService: documentExtractionService,
    s3,
});

const workflowService = new WorkflowService({
    documentAnalysisService,
    documentExtractionService,
    workflowExecutionService,
    s3,
});

// Validation schemas
const executionIdParamSchema = z.object({
    executionId: executionIdSchema,
});

const workflowIdParamSchema = z.object({
    workflowId: workflowIdSchema,
});

const router = app
    .get("/", async (c) => {
        try {
            const user = await getUser(c);
            const executions = await workflowService.getAllExecutions(user.id);
            return c.json(executions);
        } catch (error) {
            console.error("Get all executions error:", error);
            return c.json({ error: "Failed to get executions" }, 500);
        }
    })
    .get("/:executionId", zValidator("param", executionIdParamSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { executionId } = c.req.valid("param");
            const execution = await workflowService.getExecutionDetails(executionId, user.id);
            return c.json(execution);
        } catch (error) {
            console.error("Get execution details error:", error);
            if (error instanceof Error && error.message === "Execution not found") {
                return c.json({ error: "Execution not found" }, 404);
            }
            return c.json({ error: "Failed to get execution details" }, 500);
        }
    })
    .post("/", async (c) => {
        try {
            const user = await getUser(c);
            const body = await c.req.formData();
            const workflowId = body.get("workflowId") as string;
            const uploadedFile = body.get("file") as File;

            if (!workflowId) {
                return c.json({ error: "Workflow ID is required" }, 400);
            }

            if (!uploadedFile) {
                return c.json({ error: "File is required" }, 400);
            }

            const result = await workflowService.executeWorkflow(workflowId, user.id, uploadedFile);
            return c.json(result);
        } catch (error) {
            console.error("Execution error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Failed to execute workflow" }, 500);
        }
    })
    .post("/bulk", async (c) => {
        try {
            const user = await getUser(c);
            const body = await c.req.formData();
            const workflowId = body.get("workflowId") as string;
            const uploadedFiles = body.getAll("files") as File[];

            if (!workflowId) {
                return c.json({ error: "Workflow ID is required" }, 400);
            }

            if (!uploadedFiles || uploadedFiles.length === 0) {
                return c.json({ error: "At least one file is required" }, 400);
            }

            // Create individual executions for each file
            const results = await Promise.all(uploadedFiles.map((file) => workflowService.executeWorkflow(workflowId, user.id, file)));

            return c.json({ executions: results });
        } catch (error) {
            console.error("Bulk execution error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Failed to execute workflow" }, 500);
        }
    })
    .get("/workflow/:workflowId", zValidator("param", workflowIdParamSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { workflowId } = c.req.valid("param");
            const executions = await workflowService.getWorkflowExecutions(workflowId, user.id);
            return c.json(executions);
        } catch (error) {
            console.error("Get executions error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Failed to get executions" }, 500);
        }
    })
    .delete("/:executionId", zValidator("param", executionIdParamSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { executionId } = c.req.valid("param");
            await workflowService.deleteExecution(executionId, user.id);
            return c.json({ success: true });
        } catch (error) {
            console.error("Delete execution error:", error);
            if (error instanceof Error && error.message === "Execution not found") {
                return c.json({ error: "Execution not found" }, 404);
            }
            return c.json({ error: "Failed to delete execution" }, 500);
        }
    });

export default router;

export type ExecutionRouteType = typeof router;
