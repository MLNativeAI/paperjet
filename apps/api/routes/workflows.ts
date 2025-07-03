import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { logger } from "@paperjet/shared";
import { workflowService } from "@/lib/services";
import { fileIdSchema, workflowIdSchema } from "@/lib/validation";

const app = new Hono();

// Validation schemas
const updateWorkflowSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    fields: z.array(z.any()).optional(),
    isPublic: z.boolean().optional(),
});

const updateWorkflowBasicDataSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    description: z.string().optional(),
});

const createWorkflowFormSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size > 0, "File cannot be empty")
        .refine(
            (file) => file.type === "application/pdf" || file.type.startsWith("image/"),
            "File must be a PDF or image",
        ),
});

const paramIdSchema = z.object({
    id: workflowIdSchema,
});

const fileIdParamSchema = z.object({
    fileId: fileIdSchema,
});

const router = app
    .get("/", async (c) => {
        try {
            const user = await getUser(c);
            const workflows = await workflowService.getWorkflows(user.id);
            return c.json(workflows);
        } catch (error) {
            logger.error(error, "Get workflows error:");
            return c.json({ error: "Failed to get workflows" }, 500);
        }
    })
    .get("/:id", zValidator("param", paramIdSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { id: workflowId } = c.req.valid("param");
            const workflowData = await workflowService.getWorkflow(workflowId, user.id);
            return c.json(workflowData);
        } catch (error) {
            logger.error(error, "Get workflow error:");
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Failed to get workflow" }, 500);
        }
    })
    .put("/:id", zValidator("param", paramIdSchema), zValidator("json", updateWorkflowSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { id: workflowId } = c.req.valid("param");
            const body = c.req.valid("json");

            await workflowService.updateWorkflow(workflowId, user.id, body);
            return c.json({ message: "Workflow updated successfully" });
        } catch (error) {
            logger.error(error, "Update workflow error:");
            if (error instanceof z.ZodError) {
                return c.json({ error: "Invalid workflow data" }, 400);
            }
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    })
    .patch(
        "/:id/basic-data",
        zValidator("param", paramIdSchema),
        zValidator("json", updateWorkflowBasicDataSchema),
        async (c) => {
            try {
                const user = await getUser(c);
                const { id: workflowId } = c.req.valid("param");
                const body = c.req.valid("json");

                await workflowService.updateWorkflow(workflowId, user.id, body);
                return c.json({ message: "Workflow basic data updated successfully" });
            } catch (error) {
                logger.error(error, "Update workflow basic data error:");
                if (error instanceof z.ZodError) {
                    return c.json({ error: "Invalid workflow data", details: error.errors }, 400);
                }
                if (error instanceof Error && error.message === "Workflow not found") {
                    return c.json({ error: "Workflow not found" }, 404);
                }
                return c.json({ error: "Internal server error" }, 500);
            }
        },
    )
    .post("/", zValidator("form", createWorkflowFormSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { file } = c.req.valid("form");

            const result = await workflowService.createWorkflow(file, user.id);
            return c.json({ ...result, message: "Workflow created successfully" }, 201);
        } catch (error) {
            logger.error(error, "Create workflow error:");
            if (error instanceof z.ZodError) {
                return c.json({ error: "Invalid file data", details: error.errors }, 400);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    })
    .post("/:id/analyze", zValidator("param", paramIdSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { id: workflowId } = c.req.valid("param");

            // Start analysis in background (don't await)
            workflowService.analyzeWorkflowDocument(workflowId, user.id);

            // Return immediately
            return c.json({ message: "Analysis started", workflowId });
        } catch (error) {
            logger.error(error, "Document analysis error:");
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            if (error instanceof Error && error.message === "No file associated with this workflow") {
                return c.json({ error: "No file associated with this workflow" }, 400);
            }
            return c.json({ error: "Failed to start analysis" }, 500);
        }
    })
    .get("/:fileId/document", zValidator("param", fileIdParamSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { fileId } = c.req.valid("param");
            const document = await workflowService.getDocumentForFile(fileId, user.id);
            return c.json(document);
        } catch (error) {
            logger.error(error, "Get document error:");
            if (error instanceof Error && error.message === "File not found") {
                return c.json({ error: "File not found" }, 404);
            }
            return c.json({ error: "Failed to get document" }, 500);
        }
    })
    .delete("/:id", zValidator("param", paramIdSchema), async (c) => {
        try {
            const user = await getUser(c);
            const { id: workflowId } = c.req.valid("param");
            await workflowService.deleteWorkflow(workflowId, user.id);
            return c.json({ message: "Workflow deleted successfully" });
        } catch (error) {
            logger.error(error, "Delete workflow error:");
            if (error instanceof Error && error.message === "Workflow not found") {
                return c.json({ error: "Workflow not found" }, 404);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    });

export default router;

export type WorkflowRouteType = typeof router;
