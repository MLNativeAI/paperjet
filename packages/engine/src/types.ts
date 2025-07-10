import type { DbWorkflow, DbWorkflowExecution } from "@paperjet/db/types";
import z from "zod";

// Engine-specific types
export interface EngineServiceDeps {
  s3: {
    presign: (filename: string) => Promise<string>;
    file: (filename: string) => {
      write: (data: ArrayBuffer) => Promise<void>;
    };
  };
}

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
    name: z.string(),
    description: z.string(),
    type: z.enum(["text", "number", "date", "currency", "boolean"]),
    required: z.boolean(),
    categoryId: z.string(),
    lastModified: z.string().datetime().optional(),
  }),
);

export type FieldsConfiguration = z.infer<typeof fieldsConfigurationSchema>;

export const tableConfigurationSchema = z.array(
  z.object({
    id: z.string(),
    columns: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(["text", "number", "date", "currency", "boolean"]),
      }),
    ),
    slug: z.string(),
    description: z.string(),
    categoryId: z.string(),
    lastModified: z.string().datetime().optional(),
  }),
);

export type TableConfiguration = z.infer<typeof tableConfigurationSchema>;

export const workflowConfigurationSchema = z.object({
  fields: fieldsConfigurationSchema,
  tables: tableConfigurationSchema,
});

export type WorkflowConfiguration = z.infer<typeof workflowConfigurationSchema>;

export type Workflow = Omit<DbWorkflow, "configuration" | "sampleData" | "categories"> & {
  configuration: WorkflowConfiguration;
  categories: CategoriesConfiguration;
  sampleData?: ExtractionResult | null;
  sampleDataExtractedAt?: Date | null;
};

// Data extraction schemas
export const extractedValueSchema = z.object({
  fieldName: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.date()]).nullable(),
});

export const extractedTableRowSchema = z.object({
  values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.date()]).nullable()),
});

export const extractedTableSchema = z.object({
  tableName: z.string(),
  rows: z.array(extractedTableRowSchema),
});

export const extractionResultSchema = z.object({
  fields: z.array(extractedValueSchema),
  tables: z.array(extractedTableSchema),
});

export type ExtractedValue = z.infer<typeof extractedValueSchema>;
export type ExtractedTable = z.infer<typeof extractedTableSchema>;
export type ExtractionResult = z.infer<typeof extractionResultSchema>;

// Workflow runs / execution types

export type WorkflowRun = Omit<DbWorkflowExecution, "ownerId"> & {
  filename: string;
  workflowName: string;
  categories: CategoriesConfiguration;
};
