import type { DbWorkflowExecution, RuntimeModelType, WorkflowConfiguration } from "@paperjet/db/types";
import z from "zod";

export type ConnectionValidationResult = {
  isValid: boolean;
  error: string | null;
};

const availableProviders = z.enum(["google", "openai", "openrouter", "custom"]);

export const modelConfigSchema = z.object({
  provider: availableProviders,
  providerApiKey: z.string().min(1, "API key is required"),
  modelName: z.string().min(1, "Model name is required"),
  displayName: z.string().optional(),
  baseUrl: z.string().optional(),
});

export type ModelConfigParams = z.infer<typeof modelConfigSchema>;

export type PdfSplitResult = {
  success: boolean;
  total_pages: number;
  pages: {
    page_number: number;
    image_data: string;
    width: number;
    height: number;
  }[];
};

export type OcrResult = {
  success: boolean;
  markdown: string;
};

export const categoriesConfigurationSchema = z.array(
  z.object({
    categoryId: z.string(),
    slug: z.string(),
    displayName: z.string(),
    ordinal: z.number(),
  }),
);

export type CategoriesConfiguration = z.infer<typeof categoriesConfigurationSchema>;

export const fieldsConfigurationSchema = z.array(
  z.object({
    id: z.string(),
    slug: z.string(),
    description: z.string(),
    type: z.enum(["text", "number", "date", "currency", "boolean"]),
    categoryId: z.string(),
    lastModified: z.iso.datetime().optional(),
  }),
);

export type FieldsConfiguration = z.infer<typeof fieldsConfigurationSchema>;

export const tableConfigurationSchema = z.array(
  z.object({
    id: z.string(),
    columns: z.array(
      z.object({
        id: z.string(),
        slug: z.string(),
        description: z.string(),
        type: z.enum(["text", "number", "date", "currency", "boolean"]),
      }),
    ),
    slug: z.string(),
    description: z.string(),
    categoryId: z.string(),
    lastModified: z.iso.datetime().optional(),
  }),
);

export type TableConfiguration = z.infer<typeof tableConfigurationSchema>;

export const zodWorkflowField = z.object({
  name: z.string(),
  type: z.enum(["string", "date", "number", "boolean"]),
  description: z.string().optional(),
});

export const zodWorkflowObject = z.object({
  name: z.string(),
  fields: z.array(zodWorkflowField),
});

export type Workflow = {
  id: string;
  name: string;
  description: string;
  configuration: WorkflowConfiguration;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  modelType: RuntimeModelType;
};

export type WorkflowRun = Omit<DbWorkflowExecution, "ownerId"> & {
  filename: string;
  workflowName: string;
  categories: CategoriesConfiguration;
};

export type UsageData = {
  id: string;
  name: string;
  model: string;
  userId: string | null;
  userEmail: string | null;
  workflowId: string | null;
  executionId: string | null;
  totalTokens: number;
  totalCost: number;
  durationMs: number;
  createdAt: string;
};

export type UsageStats = {
  timePeriod: "30days";
  cost: number;
  requests: number;
  users: number;
  executions: number;
};
