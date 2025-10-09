import { zValidator } from "@hono/zod-validator";
import { getUserSession } from "@paperjet/auth/session";
import {
  getAllWorkflowExecutions,
  getWorkflowExecutionStatus,
  getWorkflowExecutionWithExtractedData,
} from "@paperjet/db";
import { exportExecution, getPresignedFileUrl } from "@paperjet/engine";
import { logger } from "@paperjet/shared";
import { Hono } from "hono";
import z from "zod";
import { workflowExecutionIdSchema } from "../../lib/validation";

const app = new Hono();

const router = app
  .get("/", async (c) => {
    try {
      const { session } = await getUserSession(c);
      const executions = await getAllWorkflowExecutions({ organizationId: session.activeOrganizationId });
      return c.json(executions);
    } catch (error) {
      logger.error(error, "Get all executions error:");
      return c.json({ error: "Failed to get executions" }, 500);
    }
  })
  .get(
    "/:executionId",
    zValidator(
      "param",
      z.object({
        executionId: workflowExecutionIdSchema,
      }),
    ),
    async (c) => {
      try {
        const { session } = await getUserSession(c);
        const { executionId } = c.req.valid("param");
        const execution = await getWorkflowExecutionWithExtractedData({
          workflowExecutionId: executionId,
          organizationId: session.activeOrganizationId,
        });
        return c.json(execution);
      } catch (error) {
        logger.error(error, "Get execution by ID error:");
        if (error instanceof Error && error.message === "not found") {
          return c.json({ error: "Execution not found" }, 404);
        }
        return c.json({ error: "Failed to get execution" }, 500);
      }
    },
  )
  .get(
    "/:executionId/status",
    zValidator(
      "param",
      z.object({
        executionId: workflowExecutionIdSchema,
      }),
    ),
    async (c) => {
      try {
        const { session } = await getUserSession(c);
        const { executionId } = c.req.valid("param");
        const execution = await getWorkflowExecutionStatus({
          workflowExecutionId: executionId,
          organizationId: session.activeOrganizationId,
        });
        return c.json(execution);
      } catch (error) {
        logger.error(error, "Get execution by ID error:");
        if (error instanceof Error && error.message === "not found") {
          return c.json({ error: "Execution not found" }, 404);
        }
        return c.json({ error: "Failed to get execution" }, 500);
      }
    },
  )
  .get(
    "/:executionId/file",
    zValidator(
      "param",
      z.object({
        executionId: workflowExecutionIdSchema,
      }),
    ),
    async (c) => {
      try {
        const { session } = await getUserSession(c);
        const { executionId } = c.req.valid("param");
        const documentUrl = await getPresignedFileUrl(executionId, session.activeOrganizationId);
        return c.json(documentUrl);
      } catch (error) {
        logger.error(error, "Get document url error");
        if (error instanceof Error && error.message === "not found") {
          return c.json({ error: "Execution not found" }, 404);
        }
        return c.json({ error: "Failed to get document url" }, 500);
      }
    },
  )
  .get(
    "/:executionId/export",
    zValidator(
      "param",
      z.object({
        executionId: workflowExecutionIdSchema,
      }),
    ),
    zValidator(
      "query",
      z.object({
        mode: z.enum(["csv", "json"]),
      }),
    ),
    async (c) => {
      try {
        const { session } = await getUserSession(c);
        const { executionId } = c.req.valid("param");
        const { mode } = c.req.valid("query");
        const result = await exportExecution(executionId, mode, session.activeOrganizationId);

        c.header("Content-Type", result.contentType);
        c.header("Content-Disposition", `attachment; filename="${result.filename}"`);
        return c.body(result.content);
      } catch (error) {
        logger.error(error, "Export execution failed:");
        if (error instanceof Error && error.message === "Workflow execution data not found") {
          return c.json({ error: "Execution data not found" }, 404);
        }
        return c.json({ error: "Failed to export execution" }, 500);
      }
    },
  );

export { router as v1ExecutionRouter };

export type ExecutionRoutes = typeof router;
