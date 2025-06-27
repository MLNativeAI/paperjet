import { WorkflowService } from "@paperjet/engine";
import { Hono } from "hono";
import { getUser } from "@/lib/auth";
import { s3 } from "@/lib/s3";

const app = new Hono();

// Initialize workflow service with dependencies
const workflowService = new WorkflowService({ s3 });

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
    .post("/", async (c) => {
        try {
            const user = await getUser(c);
            const body = await c.req.formData();
            const workflowId = body.get("workflowId") as string;
            const uploadedFiles = body.getAll("files") as File[];

            if (!workflowId) {
                return c.json({ error: "Workflow ID is required" }, 400);
            }

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
    .get("/workflow/:workflowId", async (c) => {
        try {
            const user = await getUser(c);
            const workflowId = c.req.param("workflowId");
            const executions = await workflowService.getWorkflowExecutions(workflowId, user.id);
            return c.json(executions);
        } catch (error) {
            console.error("Get executions error:", error);
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Failed to get executions" }, 500);
        }
    });

export default router;

export type ExecutionRouteType = typeof router;
