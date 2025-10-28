import { getAuthContext } from "@paperjet/auth/session";
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  getWorkflowByOwner,
  getWorkflowExecutionWithExtractedData,
  updateExecutionJobId,
  updateWorkflow,
} from "@paperjet/db";
import { type WorkflowConfiguration, WorkflowConfigurationSchema } from "@paperjet/db/types";
import { getWorkflows, uploadFileAndCreateExecution } from "@paperjet/engine";
import { type WorkflowExtractionData, workflowExecutionQueue } from "@paperjet/queue";
import { logger } from "@paperjet/shared";
import { Hono } from "hono";
import { describeRoute, resolver, validator as zValidator } from "hono-openapi";
import z from "zod";
import { validateFile, workflowExecutionIdSchema, workflowIdSchema } from "../../lib/validation";

const app = new Hono();

const router = app
  .get(
    "/",
    describeRoute({
      description: "Get all workflows for the organization",
      responses: {
        200: {
          description: "List of workflows",
          content: {
            "application/json": {
              schema: resolver(
                z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string(),
                    configuration: WorkflowConfigurationSchema,
                    createdAt: z.string(),
                    updatedAt: z.string(),
                    ownerId: z.string(),
                    modelType: z.enum(["fast", "accurate"]),
                  }),
                ),
              ),
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
        const workflows = await getWorkflows(organizationId);
        return c.json(workflows);
      } catch (error) {
        logger.error(error, "Failed to fetch workflows");
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  )
  .post(
    "/",
    describeRoute({
      description: "Create a new workflow",
      responses: {
        201: {
          description: "Workflow created",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  workflowId: z.string(),
                  message: z.string(),
                }),
              ),
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
      "json",
      z.object({
        name: z.string().min(1, "Workflow name is required"),
        description: z.string().default(""),
        configuration: WorkflowConfigurationSchema,
        modelType: z.enum(["fast", "accurate"]),
      }),
    ),
    async (c) => {
      try {
        const createWorkflowData = c.req.valid("json");
        const { organizationId, userId } = await getAuthContext(c);
        logger.info({ data: createWorkflowData }, `Creating new workflow via API`);
        const { id: workflowId } = await createWorkflow({
          name: createWorkflowData.name,
          description: createWorkflowData.description,
          configuration: createWorkflowData.configuration,
          modelType: createWorkflowData.modelType,
          organizationId,
          userId,
        });
        logger.info({ workflowId, name: createWorkflowData.name }, "Workflow created");
        return c.json({ workflowId: workflowId, message: "Workflow created" }, 201);
      } catch (error) {
        // TODO unified error handling for API requests & shared error types
        logger.error(error, "Create workflow error:");
        if (error instanceof Error) {
          return c.json(
            {
              error: error.message,
            },
            500,
          );
        } else {
          return c.json(
            {
              error: "Unknown server error",
            },
            500,
          );
        }
      }
    },
  )
  .post(
    "/:workflowId/execute",
    describeRoute({
      description: "Execute a workflow with a file",
      responses: {
        200: {
          description: "Execution started",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  workflowExecutionId: z.string(),
                  workflowId: z.string(),
                  status: z.string(),
                  fileId: z.string(),
                  filename: z.string(),
                }),
              ),
            },
          },
        },
        400: {
          description: "Invalid file",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
        404: {
          description: "Workflow not found",
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
        workflowId: workflowIdSchema,
      }),
    ),
    async (c) => {
      try {
        const authContext = await getAuthContext(c);
        const { workflowId } = c.req.valid("param");

        // Parse and validate file
        const body = await c.req.parseBody();
        if (!(body.file instanceof File)) {
          return c.json({ error: "Invalid file" }, 400);
        }
        const validation = validateFile(body.file);

        if (!validation.success) {
          return c.json({ error: validation.error }, 400);
        }

        if (authContext.activePlan === "free") {
          return c.json({ error: "You need an active plan to run workflows" }, 403);
        }

        const execution = await uploadFileAndCreateExecution(workflowId, validation.file, authContext);
        const workflow = await getWorkflow({ workflowId });
        const validConfig = workflow.configuration as WorkflowConfiguration;
        const workflowExecutionParams: WorkflowExtractionData = {
          workflowId: execution.workflowId,
          workflowExecutionId: execution.workflowExecutionId,
          modelType: workflow.modelType,
          configuration: validConfig,
          inputType: validation.file.type,
          step: "INIT",
          authContext,
        };
        logger.info(workflowExecutionParams, "Workflow execuion params:");
        const job = await workflowExecutionQueue.add(execution.workflowExecutionId, workflowExecutionParams);
        if (!job.id) {
          throw new Error("job id not found");
        }
        await updateExecutionJobId({
          workflowExecutionId: execution.workflowExecutionId,
          jobId: job.id,
        });
        return c.json({
          ...execution,
        });
      } catch (error) {
        logger.error(error, "Re-extract data error:");
        if (error instanceof Error && error.message === "Workflow not found") {
          return c.json({ error: "Workflow not found" }, 404);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  )
  .get(
    "/:workflowId",
    describeRoute({
      description: "Get workflow details by ID",
      responses: {
        200: {
          description: "Workflow details",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  description: z.string(),
                  configuration: WorkflowConfigurationSchema,
                  createdAt: z.string(),
                  updatedAt: z.string(),
                  ownerId: z.string(),
                  modelType: z.enum(["fast", "accurate"]),
                }),
              ),
            },
          },
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        workflowId: workflowIdSchema,
      }),
    ),
    async (c) => {
      const { organizationId } = await getAuthContext(c);
      const { workflowId } = c.req.valid("param");
      const workflowData = await getWorkflowByOwner({
        workflowId,
        organizationId,
      });
      return c.json(workflowData);
    },
  )
  .put(
    "/:workflowId",
    describeRoute({
      description: "Update an existing workflow",
      responses: {
        200: {
          description: "Workflow updated",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  workflowId: z.string(),
                  message: z.string(),
                }),
              ),
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
      "json",
      z.object({
        name: z.string().min(1, "Workflow name is required"),
        description: z.string().default(""),
        configuration: WorkflowConfigurationSchema,
        modelType: z.enum(["fast", "accurate"]),
      }),
    ),
    zValidator(
      "param",
      z.object({
        workflowId: workflowIdSchema,
      }),
    ),
    async (c) => {
      try {
        const { workflowId } = c.req.valid("param");
        const updateWorkflowData = c.req.valid("json");
        const { organizationId } = await getAuthContext(c);
        logger.info({ data: updateWorkflowData }, `Updating workflow ${workflowId}`);
        await updateWorkflow({
          workflowId,
          name: updateWorkflowData.name,
          modelType: updateWorkflowData.modelType,
          description: updateWorkflowData.description,
          configuration: updateWorkflowData.configuration,
          organizationId,
        });
        logger.info({ workflowId, name: updateWorkflowData.name }, "Workflow updated");
        return c.json({ workflowId, message: "Workflow updated" }, 200);
      } catch (error) {
        // TODO unified error handling for API requests & shared error types
        logger.error(error, "update workflow error:");
        if (error instanceof Error) {
          return c.json(
            {
              error: error.message,
            },
            500,
          );
        } else {
          return c.json(
            {
              error: "Unknown server error",
            },
            500,
          );
        }
      }
    },
  )
  .get(
    "/:workflowId/executions/:workflowExecutionId",
    describeRoute({
      description: "Get workflow execution details",
      responses: {
        200: {
          description: "Execution details",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  status: z.enum(["Queued", "Processing", "Failed", "Completed"]),
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
                }),
              ),
            },
          },
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        workflowId: workflowIdSchema,
        workflowExecutionId: workflowExecutionIdSchema,
      }),
    ),
    async (c) => {
      const { organizationId } = await getAuthContext(c);
      const { workflowExecutionId } = c.req.valid("param");
      const execution = await getWorkflowExecutionWithExtractedData({
        workflowExecutionId,
        organizationId,
      });
      return c.json(execution);
    },
  )
  .delete(
    "/:workflowId",
    describeRoute({
      description: "Delete a workflow",
      responses: {
        200: {
          description: "Workflow deleted",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Workflow not found",
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
        workflowId: workflowIdSchema,
      }),
    ),
    async (c) => {
      try {
        const { organizationId } = await getAuthContext(c);
        const { workflowId } = c.req.valid("param");

        await deleteWorkflow({
          workflowId,
          organizationId,
        });

        return c.json({ message: "Workflow deleted successfully" });
      } catch (error) {
        logger.error(error, "Delete workflow error:");
        if (error instanceof Error && error.message === "Workflow not found") {
          return c.json({ error: "Workflow not found" }, 404);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  );

export { router as v1WorkflowRouter };

export type WorkflowRoutes = typeof router;
