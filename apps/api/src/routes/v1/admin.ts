import {
  addNewModel,
  deleteModel,
  getRuntimeConfiguration,
  listModels,
  setRuntimeModel,
  updateModel,
} from "@paperjet/db";
import { validateConnection } from "@paperjet/engine";
import { modelConfigSchema } from "@paperjet/engine/types";
import { Hono } from "hono";
import { describeRoute, resolver, validator as zValidator } from "hono-openapi";
import { z } from "zod";

const app = new Hono();

const router = app
  .get(
    "/runtime-config",
    describeRoute({
      description: "Returns the models that are used in workflow execution",
      responses: {
        200: {
          description: "Runtime configuration",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  fastModel: z
                    .object({
                      name: z.string(),
                      modelId: z.string(),
                    })
                    .optional(),
                  accurateModel: z
                    .object({
                      name: z.string(),
                      modelId: z.string(),
                    })
                    .optional(),
                }),
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      const config = await getRuntimeConfiguration();
      return c.json(config);
    },
  )
  .post(
    "/runtime-config",
    describeRoute({
      description: "Set runtime model configuration",
      responses: {
        200: {
          description: "Success response",
          content: {
            "application/json": {
              schema: resolver(z.object({ success: z.boolean() })),
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
        type: z.enum(["fast", "accurate"]),
        modelId: z.string(),
      }),
    ),
    async (c) => {
      try {
        const { type, modelId } = c.req.valid("json");
        await setRuntimeModel(type, modelId);
        return c.json({ success: true });
      } catch (error) {
        console.error("Failed to set runtime model:", error);
        return c.json({ error: "Failed to set runtime model" }, 500);
      }
    },
  )
  .get(
    "/models",
    describeRoute({
      description: "List all models",
      responses: {
        200: {
          description: "List of models",
          content: {
            "application/json": {
              schema: resolver(z.array(z.any())),
            },
          },
        },
      },
    }),
    async (c) => {
      const models = await listModels();
      return c.json(models);
    },
  )
  .post(
    "/models/add",
    describeRoute({
      description: "Add a new model",
      responses: {
        200: {
          description: "Model added successfully",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  success: z.boolean(),
                  model: z.any(),
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
    zValidator("json", modelConfigSchema),
    async (c) => {
      try {
        const modelParams = c.req.valid("json");
        const result = await addNewModel(modelParams);
        return c.json({ success: true, model: result[0] });
      } catch (error) {
        console.error("Failed to add model:", error);
        return c.json({ error: "Failed to add model configuration" }, 500);
      }
    },
  )
  .post(
    "/models/validate-connection",
    describeRoute({
      description: "Validate model connection",
      responses: {
        200: {
          description: "Validation result",
          content: {
            "application/json": {
              schema: resolver(z.any()),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.any() })),
            },
          },
        },
      },
    }),
    zValidator("json", modelConfigSchema),
    async (c) => {
      try {
        const modelParams = c.req.valid("json");
        const result = await validateConnection(modelParams);
        return c.json(result);
      } catch (error) {
        return c.json({ error: error }, 500);
      }
    },
  )
  .put(
    "/models/update",
    describeRoute({
      description: "Update an existing model",
      responses: {
        200: {
          description: "Model updated successfully",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  success: z.boolean(),
                  model: z.any(),
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
    zValidator("json", z.object({ id: z.string() }).merge(modelConfigSchema)),
    async (c) => {
      try {
        const { id, ...modelParams } = c.req.valid("json");
        const result = await updateModel(id, modelParams);
        return c.json({ success: true, model: result[0] });
      } catch (error) {
        console.error("Failed to update model:", error);
        return c.json(
          {
            error: (error as Error).message || "Failed to update model configuration",
          },
          500,
        );
      }
    },
  )
  .delete(
    "/models/delete",
    describeRoute({
      description: "Delete a model",
      responses: {
        200: {
          description: "Model deleted successfully",
          content: {
            "application/json": {
              schema: resolver(z.object({ success: z.boolean() })),
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
    zValidator("json", z.object({ id: z.string() })),
    async (c) => {
      try {
        const { id } = c.req.valid("json");
        await deleteModel(id);
        return c.json({ success: true });
      } catch (error) {
        console.error("Failed to delete model:", error);
        return c.json(
          {
            error: (error as Error).message || "Failed to delete model configuration",
          },
          500,
        );
      }
    },
  );
export { router as v1AdminRouter };
export type AdminRoutes = typeof router;
