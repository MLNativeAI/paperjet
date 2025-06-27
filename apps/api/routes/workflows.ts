import { WorkflowService } from "@paperjet/engine";
import { Hono } from "hono";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { s3 } from "@/lib/s3";

const app = new Hono();

// Initialize workflow service with dependencies
const workflowService = new WorkflowService({ s3 });

const router = app
    .get("/", async (c) => {
        try {
            const user = await getUser(c);
            const workflows = await workflowService.getWorkflows(user.id);
            return c.json(workflows);
        } catch (error) {
            console.error("Get workflows error:", error);
            return c.json({ error: "Failed to get workflows" }, 500);
        }
    })
    .get("/:id", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("id");
            const workflowData = await workflowService.getWorkflow(workflowId, user.id);
            return c.json(workflowData);
        } catch (error) {
            console.error("Get workflow error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Failed to get workflow" }, 500);
        }
    })
    .put("/:id", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("id");
            const body = await c.req.json();

            await workflowService.updateWorkflow(workflowId, user.id, body);
            return c.json({ message: "Workflow updated successfully" });
        } catch (error) {
            console.error("Update workflow error:", error);
            if (error instanceof z.ZodError) {
                return c.json({ error: "Invalid workflow data" }, 400);
            }
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    })
    .get("/:id/analysis-status", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("id");
            const analysisStatus = await workflowService.getAnalysisStatus(workflowId, user.id);
            return c.json(analysisStatus);
        } catch (error) {
            console.error("Get analysis status error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Failed to get analysis status" }, 500);
        }
    })
    .post("/", async (c) => {
        try {
            const user = await getUser(c);
            const body = await c.req.json();
            const result = await workflowService.createWorkflow(user.id, body);
            return c.json({ ...result, message: "Workflow created successfully" }, 201);
        } catch (error) {
            console.error("Create workflow error:", error);
            if (error instanceof z.ZodError) {
                return c.json({ error: "Invalid workflow data" }, 400);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    })
    .post("/analyze", async (c) => {
        try {
            const user = await getUser(c);
            const body = await c.req.formData();
            const fileParam = body.get("file") as File;

            if (!fileParam) {
                return c.json({ error: "File is required" }, 400);
            }

            const result = await workflowService.analyzeDocument(fileParam, user.id);
            return c.json(result);
        } catch (error) {
            console.error("Document analysis error:", error);
            return c.json({ error: "Failed to analyze document" }, 500);
        }
    })
    .post("/create-from-file", async (c) => {
        try {
            const user = await getUser(c);
            const body = await c.req.formData();
            const fileParam = body.get("file") as File;

            if (!fileParam) {
                return c.json({ error: "File is required" }, 400);
            }

            const result = await workflowService.createWorkflowFromFile(fileParam, user.id);
            return c.json({
                ...result,
                message: "Workflow created successfully",
            });
        } catch (error) {
            console.error("Create workflow from file error:", error);
            return c.json({ error: "Failed to create workflow from file" }, 500);
        }
    })
    .post("/extract", async (c) => {
        try {
            const user = await getUser(c);
            const body = await c.req.json();
            const { fileId, ...extractionConfig } = body;

            const result = await workflowService.extractDataFromDocument(fileId, user.id, extractionConfig);
            return c.json(result);
        } catch (error) {
            console.error("Data extraction error:", error);
            if (error instanceof Error && error.message === "File not found") {
                return c.json({ error: "File not found" }, 404);
            }
            if (error instanceof z.ZodError) {
                return c.json({ error: "Invalid extraction configuration" }, 400);
            }
            return c.json({ error: "Failed to extract data from document" }, 500);
        }
    })
    .get("/:fileId/document", async (c) => {
        try {
            const user = await getUser(c);
            const fileId = c.req.param("fileId");
            const document = await workflowService.getDocumentForFile(fileId, user.id);
            return c.json(document);
        } catch (error) {
            console.error("Get document error:", error);
            if (error instanceof Error && error.message === "File not found") {
                return c.json({ error: "File not found" }, 404);
            }
            return c.json({ error: "Failed to get document" }, 500);
        }
    })
    .post("/:id/execute", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("id");
            const body = await c.req.formData();
            const uploadedFiles = body.getAll("files") as File[];

            const result = await workflowService.executeWorkflow(workflowId, user.id, uploadedFiles);
            return c.json(result);
        } catch (error) {
            console.error("Execution error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            if (error instanceof Error && error.message === "No files provided") {
                return c.json({ error: "No files provided" }, 400);
            }
            return c.json({ error: "Failed to execute workflow" }, 500);
        }
    })
    .get("/:id/executions", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("id");
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
    .delete("/:id", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("id");
            await workflowService.deleteWorkflow(workflowId, user.id);
            return c.json({ message: "Workflow deleted successfully" });
        } catch (error) {
            console.error("Delete workflow error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    });

export default router;

export type WorkflowRouteType = typeof router;
