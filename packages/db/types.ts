import { z } from "zod";
import type { file, workflowExecution, workflow } from "./schema";

export type FileData = typeof file.$inferSelect;

// Workflow types
export const workflowStatusSchema = z.enum(["draft", "analyzing", "extracting", "configuring", "active"]);
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;

// export type ValidWorkflow = Omit<Workflow, "configuration"> & {
//     configuration: WorkflowConfiguration;
// };

// Field extraction configuration
export const fieldTypeSchema = z.enum(["text", "number", "date", "currency", "boolean"]);

export const extractionFieldSchema = z.object({
    name: z.string(),
    description: z.string(),
    type: fieldTypeSchema,
    required: z.boolean().default(false),
});

export const extractionFieldWithSampleSchema = z.object({
    name: z.string(),
    description: z.string(),
    type: fieldTypeSchema,
    required: z.boolean().default(false),
    sampleValue: z.union([z.string(), z.number(), z.boolean(), z.date()]).nullable().optional(),
});

export const extractionTableSchema = z.object({
    name: z.string(),
    description: z.string(),
    columns: z.array(extractionFieldSchema),
});

export const workflowConfigurationWithSampleSchema = z.object({
    fields: z.array(extractionFieldWithSampleSchema),
    tables: z.array(extractionTableSchema),
    documentType: z.string().optional(),
});

export type ExtractionField = z.infer<typeof extractionFieldSchema>;
export type ExtractionFieldWithSample = z.infer<typeof extractionFieldWithSampleSchema>;
export type ExtractionTable = z.infer<typeof extractionTableSchema>;
export type WorkflowConfigurationWithSample = z.infer<typeof workflowConfigurationWithSampleSchema>;

// Document analysis result
export const documentAnalysisSchema = z.object({
    documentType: z.string(),
    suggestedFields: z.array(extractionFieldSchema),
    suggestedTables: z.array(extractionTableSchema),
});

export const categorySchema = z.object({
    slug: z.string(),
    displayName: z.string(),
    ordinal: z.number(),
});

export type Category = z.infer<typeof categorySchema>;

export const fieldCategoryAnalysisSchema = z.object({
    suggestedFields: z.array(extractionFieldSchema),
    suggestedTables: z.array(extractionTableSchema),
});

export type FieldCategoryAnalysis = z.infer<typeof fieldCategoryAnalysisSchema>;

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

// Workflow execution types
export type WorkflowExecutionData = typeof workflowExecution.$inferSelect;
