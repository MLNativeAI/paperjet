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
            const contentType = c.req.header("content-type");

            let result;
            if (contentType?.includes("multipart/form-data")) {
                // Handle file upload for workflow creation
                const body = await c.req.formData();
                const fileParam = body.get("file") as File;

                if (!fileParam) {
                    return c.json({ error: "File is required" }, 400);
                }

                result = await workflowService.createWorkflowFromFile(fileParam, user.id);
            } else {
                // Handle JSON workflow creation
                const body = await c.req.json();
                result = await workflowService.createWorkflow(user.id, body);
            }

            return c.json({ ...result, message: "Workflow created successfully" }, 201);
        } catch (error) {
            console.error("Create workflow error:", error);
            if (error instanceof z.ZodError) {
                return c.json({ error: "Invalid workflow data" }, 400);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    })
    .post("/:id/analyze", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("id");

            // Start analysis in background (don't await)
            workflowService.analyzeWorkflowDocument(workflowId, user.id).catch((error) => {
                console.error("Background analysis failed:", error);
            });

            // Return immediately
            return c.json({ message: "Analysis started", workflowId });
        } catch (error) {
            console.error("Document analysis error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            if (error instanceof Error && error.message === "No file associated with this workflow") {
                return c.json({ error: "No file associated with this workflow" }, 400);
            }
            return c.json({ error: "Failed to start analysis" }, 500);
        }
    })
    .post("/:id/extract", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("id");
            const body = await c.req.json();
            const { fileId, ...extractionConfig } = body;

            const result = await workflowService.extractDataFromDocument(fileId, user.id, extractionConfig);
            return c.json(result);
        } catch (error) {
            console.error("Data extraction error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
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
