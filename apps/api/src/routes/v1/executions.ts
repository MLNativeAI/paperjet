import { getAuthContext } from "@paperjet/auth/session";
import {
  getAllWorkflowExecutions,
  getWorkflowExecutionStatus,
  getWorkflowExecutionWithExtractedData,
} from "@paperjet/db";
import { WorkflowExecutionStatus } from "@paperjet/db/types";
import { exportExecution, getPresignedFileUrl } from "@paperjet/engine";
import { logger } from "@paperjet/shared";
import { Hono } from "hono";
import { describeRoute, resolver, validator as zValidator } from "hono-openapi";
import z from "zod";
import { workflowExecutionIdSchema } from "../../lib/validation";

const executionsResponseSchema = z.array(
  z.object({
    status: WorkflowExecutionStatus,
    id: z.string(),
    createdAt: z.string(),
    ownerId: z.string(),
    workflowId: z.string(),
    workflowName: z.string(),
    fileId: z.string(),
    fileName: z.string(),
    jobId: z.string().nullable(),
    errorMessage: z.string().nullable(),
    startedAt: z.string(),
    completedAt: z.string().nullable(),
  }),
);

const executionResponseSchema = z.object({
  status: WorkflowExecutionStatus,
  id: z.string(),
  createdAt: z.string(),
  ownerId: z.string(),
  workflowId: z.string(),
  workflowName: z.string(),
  fileId: z.string(),
  fileName: z.string(),
  jobId: z.string().nullable(),
  errorMessage: z.string().nullable(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  extractedData: z.any(),
});

const statusResponseSchema = z.object({
  id: z.string(),
  status: WorkflowExecutionStatus,
  workflowId: z.string(),
  fileId: z.string(),
  jobId: z.string().nullable(),
  errorMessage: z.string().nullable(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
});

const fileUrlResponseSchema = z.object({ url: z.string() });
const exportQuerySchema = z.object({ mode: z.enum(["csv", "json"]) });

const app = new Hono();

const router = app
  .get(
    "/",
    describeRoute({
      description: "Get all workflow executions for the organization",
      responses: {
        200: {
          description: "List of executions",
          content: {
            "application/json": {
              schema: resolver(executionsResponseSchema),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const { organizationId } = await getAuthContext(c);
        const executions = await getAllWorkflowExecutions({
          organizationId,
        });
        return c.json(executions);
      } catch (error) {
        logger.error(error, "Get all executions error:");
        return c.json({ error: "Failed to get executions" }, 500);
      }
    },
  )
  .get(
    "/:executionId",
    describeRoute({
      description: "Get workflow execution details by ID",
      responses: {
        200: {
          description: "Execution details",
          content: {
            "application/json": {
              schema: resolver(executionResponseSchema),
            },
          },
        },
        404: {
          description: "Execution not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        executionId: workflowExecutionIdSchema,
      }),
    ),
    async (c) => {
      try {
        const { organizationId } = await getAuthContext(c);
        const { executionId } = c.req.valid("param");
        const execution = await getWorkflowExecutionWithExtractedData({
          workflowExecutionId: executionId,
          organizationId,
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
    describeRoute({
      description: "Get workflow execution status by ID",
      responses: {
        200: {
          description: "Execution status",
          content: {
            "application/json": {
              schema: resolver(statusResponseSchema),
            },
          },
        },
        404: {
          description: "Execution not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        executionId: workflowExecutionIdSchema,
      }),
    ),
    async (c) => {
      try {
        const { organizationId } = await getAuthContext(c);
        const { executionId } = c.req.valid("param");
        const execution = await getWorkflowExecutionStatus({
          workflowExecutionId: executionId,
          organizationId,
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
    describeRoute({
      description: "Get presigned URL for execution file",
      responses: {
        200: {
          description: "Presigned URL",
          content: {
            "application/json": {
              schema: resolver(fileUrlResponseSchema),
            },
          },
        },
        404: {
          description: "Execution not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        executionId: workflowExecutionIdSchema,
      }),
    ),
    async (c) => {
      try {
        const { organizationId } = await getAuthContext(c);
        const { executionId } = c.req.valid("param");
        const documentUrl = await getPresignedFileUrl(executionId, organizationId);
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
    describeRoute({
      description: "Export workflow execution data",
      responses: {
        200: {
          description: "Exported data file",
          content: {
            "application/octet-stream": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
        404: {
          description: "Execution data not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        executionId: workflowExecutionIdSchema,
      }),
    ),
    zValidator("query", exportQuerySchema),
    async (c) => {
      try {
        const { organizationId } = await getAuthContext(c);
        const { executionId } = c.req.valid("param");
        const { mode } = c.req.valid("query");
        const result = await exportExecution(executionId, mode, organizationId);

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
