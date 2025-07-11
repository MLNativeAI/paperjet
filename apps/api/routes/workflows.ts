import { zValidator } from "@hono/zod-validator";
import {
  analyzeWorkflowDocument,
  createWorkflow,
  createWorkflowField,
  createWorkflowFromTemplateData,
  createWorkflowTable,
  deleteWorkflow,
  deleteWorkflowField,
  deleteWorkflowTable,
  extractDataFromDocument,
  getDocumentForFile,
  getWorkflow,
  getWorkflows,
  updateWorkflow,
  updateWorkflowField,
  updateWorkflowTable,
} from "@paperjet/engine";
import type { CategoriesConfiguration, ExtractionResult, WorkflowConfiguration } from "@paperjet/engine/types";
import { logger, withExecutionContext } from "@paperjet/shared";
import { Hono } from "hono";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { fileIdSchema, workflowIdSchema } from "@/lib/validation";

const app = new Hono();

// Validation schemas
const updateWorkflowSchema = z.object({
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  fields: z.array(z.any()).optional(),
  isPublic: z.boolean().optional(),
});

const updateWorkflowBasicDataSchema = z.object({
  slug: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
});

const updateFieldSchema = z.object({
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["text", "number", "date", "currency", "boolean"]).optional(),
  required: z.boolean().optional(),
  categoryId: z.string().optional(),
});

const updateTableSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/, {
      message:
        "Table slug must be in snake_case format (lowercase letters, numbers, and underscores only, starting with a letter)",
    })
    .optional(),
  description: z.string().optional(),
  columns: z
    .array(
      z.object({
        id: z.string(),
        slug: z.string().regex(/^[a-z][a-z0-9_]*$/, {
          message:
            "Column name must be in snake_case format (lowercase letters, numbers, and underscores only, starting with a letter)",
        }),
        description: z.string(),
        type: z.enum(["text", "number", "date", "currency", "boolean"]),
      }),
    )
    .optional(),
  categoryId: z.string().optional(),
});

const createWorkflowFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "File cannot be empty")
    .refine((file) => file.type === "application/pdf" || file.type.startsWith("image/"), "File must be a PDF or image"),
});

const createWorkflowFromTemplateSchema = z.object({
  slug: z.string().min(1, "Workflow name is required").default("New Workflow"),
  description: z.string().default(""),
  configuration: z.string(),
  categories: z.string(),
  sampleData: z.string(),
  templateFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Template file cannot be empty")
    .refine(
      (file) => file.type === "application/pdf" || file.type.startsWith("image/"),
      "Template file must be a PDF or image",
    ),
});

const paramIdSchema = z.object({
  id: workflowIdSchema,
});

const fileIdParamSchema = z.object({
  fileId: fileIdSchema,
});

const fieldParamSchema = z.object({
  id: workflowIdSchema,
  fieldId: z.string().min(1),
});

const tableParamSchema = z.object({
  id: workflowIdSchema,
  tableId: z.string().min(1),
});

const router = app
  .get("/", async (c) => {
    try {
      logger.info("Getting workflows");
      const user = await getUser(c);
      const workflows = await getWorkflows(user.id);
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
      const workflowData = await getWorkflow(workflowId, user.id);
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

      await updateWorkflow(workflowId, user.id, body);
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

        await updateWorkflow(workflowId, user.id, body);
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

      const result = await createWorkflow(file, user.id);
      return c.json({ ...result, message: "Workflow created successfully" }, 201);
    } catch (error) {
      logger.error(error, "Create workflow error:");
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid file data", details: error.errors }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post("/from-template", zValidator("form", createWorkflowFromTemplateSchema), async (c) => {
    try {
      const user = await getUser(c);
      const validForm = c.req.valid("form");

      const result = await createWorkflowFromTemplateData(
        validForm.slug,
        validForm.description,
        JSON.parse(validForm.configuration) as WorkflowConfiguration,
        JSON.parse(validForm.categories) as CategoriesConfiguration,
        JSON.parse(validForm.sampleData) as ExtractionResult,
        validForm.templateFile,
        user.id,
      );
      return c.json({ ...result, message: "Workflow created from template successfully" }, 201);
    } catch (error) {
      logger.error(error, "Create workflow from template error:");
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid template data", details: error.errors }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post("/:id/analyze", zValidator("param", paramIdSchema), async (c) => {
    try {
      const { id: workflowId } = c.req.valid("param");

      // dont await, we want to return immediately

      await withExecutionContext({ workflowId }, async () => {
        return await analyzeWorkflowDocument(workflowId);
      });

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
      const document = await getDocumentForFile(fileId, user.id);
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
      await deleteWorkflow(workflowId, user.id);
      return c.json({ message: "Workflow deleted successfully" });
    } catch (error) {
      logger.error(error, "Delete workflow error:");
      if (error instanceof Error && error.message === "Workflow not found") {
        return c.json({ error: "Workflow not found" }, 404);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .patch(
    "/:id/fields/:fieldId",
    zValidator("param", fieldParamSchema),
    zValidator("json", updateFieldSchema),
    async (c) => {
      try {
        const user = await getUser(c);
        const { id: workflowId, fieldId } = c.req.valid("param");
        const updates = c.req.valid("json");

        const updatedField = await updateWorkflowField(workflowId, fieldId, user.id, updates);
        return c.json({
          field: updatedField,
          message: "Field updated successfully",
        });
      } catch (error) {
        logger.error(error, "Update workflow field error:");
        if (error instanceof z.ZodError) {
          return c.json(
            {
              error: "Invalid field data",
              details: error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
              })),
            },
            400,
          );
        }
        if (error instanceof Error && error.message === "Workflow not found") {
          return c.json({ error: "Workflow not found" }, 404);
        }
        if (error instanceof Error && error.message === "Field not found") {
          return c.json({ error: "Field not found" }, 404);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  )
  .patch(
    "/:id/tables/:tableId",
    zValidator("param", tableParamSchema),
    zValidator("json", updateTableSchema),
    async (c) => {
      try {
        const user = await getUser(c);
        const { id: workflowId, tableId } = c.req.valid("param");
        const updates = c.req.valid("json");

        const updatedTable = await updateWorkflowTable(workflowId, tableId, user.id, updates);
        return c.json({
          table: updatedTable,
          message: "Table updated successfully",
        });
      } catch (error) {
        logger.error(error, "Update workflow table error:");
        if (error instanceof z.ZodError) {
          return c.json(
            {
              error: "Invalid table data",
              details: error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
              })),
            },
            400,
          );
        }
        if (error instanceof Error && error.message === "Workflow not found") {
          return c.json({ error: "Workflow not found" }, 404);
        }
        if (error instanceof Error && error.message === "Table not found") {
          return c.json({ error: "Table not found" }, 404);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  )
  .post("/:id/re-extract", zValidator("param", paramIdSchema), async (c) => {
    try {
      const user = await getUser(c);
      const { id: workflowId } = c.req.valid("param");

      // Get the workflow
      const workflowData = await getWorkflow(workflowId, user.id);

      // Re-extract data from the sample document
      await extractDataFromDocument(workflowId, workflowData.fileId, user.id, workflowData.configuration);

      return c.json({ message: "Data extraction started successfully" });
    } catch (error) {
      logger.error(error, "Re-extract data error:");
      if (error instanceof Error && error.message === "Workflow not found") {
        return c.json({ error: "Workflow not found" }, 404);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post(
    "/:id/fields",
    zValidator("param", paramIdSchema),
    zValidator(
      "json",
      z.object({
        slug: z.string().min(1),
        description: z.string(),
        type: z.enum(["text", "number", "date", "currency", "boolean"]),
        required: z.boolean(),
        categoryId: z.string(),
      }),
    ),
    async (c) => {
      try {
        const user = await getUser(c);
        const { id: workflowId } = c.req.valid("param");
        const fieldData = c.req.valid("json");

        const newField = await createWorkflowField(workflowId, user.id, fieldData);

        return c.json({ field: newField, message: "Field created successfully" }, 201);
      } catch (error) {
        logger.error(error, "Create workflow field error:");
        if (error instanceof z.ZodError) {
          return c.json(
            {
              error: "Invalid field data",
              details: error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
              })),
            },
            400,
          );
        }
        if (error instanceof Error && error.message === "Workflow not found") {
          return c.json({ error: "Workflow not found" }, 404);
        }
        return c.json({ error: "Failed to create field" }, 500);
      }
    },
  )
  .delete("/:id/fields/:fieldId", zValidator("param", fieldParamSchema), async (c) => {
    try {
      const user = await getUser(c);
      const { id: workflowId, fieldId } = c.req.valid("param");

      await deleteWorkflowField(workflowId, fieldId, user.id);

      return c.json({ message: "Field deleted successfully" });
    } catch (error) {
      logger.error(error, "Delete workflow field error:");
      if (error instanceof Error) {
        if (error.message === "Workflow not found" || error.message === "Field not found") {
          return c.json({ error: error.message }, 404);
        }
      }
      return c.json({ error: "Failed to delete field" }, 500);
    }
  })
  .post(
    "/:id/tables",
    zValidator("param", paramIdSchema),
    zValidator(
      "json",
      z.object({
        slug: z.string().min(1),
        description: z.string(),
        categoryId: z.string(),
        columns: z.array(
          z.object({
            slug: z.string().min(1),
            description: z.string(),
            type: z.enum(["text", "number", "date", "currency", "boolean"]),
          }),
        ),
      }),
    ),
    async (c) => {
      try {
        const user = await getUser(c);
        const { id: workflowId } = c.req.valid("param");
        const tableData = c.req.valid("json");

        const newTable = await createWorkflowTable(workflowId, user.id, tableData);

        return c.json({ table: newTable, message: "Table created successfully" }, 201);
      } catch (error) {
        logger.error(error, "Create workflow table error:");
        if (error instanceof z.ZodError) {
          return c.json(
            {
              error: "Invalid table data",
              details: error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
              })),
            },
            400,
          );
        }
        if (error instanceof Error && error.message === "Workflow not found") {
          return c.json({ error: "Workflow not found" }, 404);
        }
        return c.json({ error: "Failed to create table" }, 500);
      }
    },
  )
  .delete("/:id/tables/:tableId", zValidator("param", tableParamSchema), async (c) => {
    try {
      const user = await getUser(c);
      const { id: workflowId, tableId } = c.req.valid("param");

      await deleteWorkflowTable(workflowId, tableId, user.id);

      return c.json({ message: "Table deleted successfully" });
    } catch (error) {
      logger.error(error, "Delete workflow table error:");
      if (error instanceof Error) {
        if (error.message === "Workflow not found" || error.message === "Table not found") {
          return c.json({ error: error.message }, 404);
        }
      }
      return c.json({ error: "Failed to delete table" }, 500);
    }
  });

export default router;

export type WorkflowRouteType = typeof router;
