import { z } from "zod";
import type { file, workflow, workflowExecution, workflowFile } from "./schema";

export const uploadFileSchema = z.object({
    file: z.instanceof(File),
    name: z.string(),
});

export type FileData = typeof file.$inferSelect;

export type FileDataWithPresignedUrl = FileData & {
    presignedUrl: string;
};

// Workflow types
export const workflowStatusSchema = z.enum(["draft", "analyzing", "extracting", "configuring", "active"]);
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;

export type WorkflowData = typeof workflow.$inferSelect;
export type WorkflowFileData = typeof workflowFile.$inferSelect;

// Field extraction configuration
export const fieldTypeSchema = z.enum(["text", "number", "date", "currency", "boolean"]);

export const extractionFieldSchema = z.object({
    name: z.string(),
    description: z.string(),
    type: fieldTypeSchema,
    required: z.boolean().default(false),
    category: z.string().default("General Information"),
});

export const extractionTableSchema = z.object({
    name: z.string(),
    description: z.string(),
    columns: z.array(extractionFieldSchema),
});

export const workflowConfigurationSchema = z.object({
    fields: z.array(extractionFieldSchema),
    tables: z.array(extractionTableSchema),
    documentType: z.string().optional(),
});

export type ExtractionField = z.infer<typeof extractionFieldSchema>;
export type ExtractionTable = z.infer<typeof extractionTableSchema>;
export type WorkflowConfiguration = z.infer<typeof workflowConfigurationSchema>;

// Document analysis result
export const documentAnalysisSchema = z.object({
    documentType: z.string(),
    suggestedFields: z.array(extractionFieldSchema),
    suggestedTables: z.array(extractionTableSchema),
});


// Multi-step analysis schemas
export const documentTypeAndCategoriesSchema = z.object({
    documentType: z.string(),
    description: z.string(),
    categories: z.array(z.string()),
});

export type DocumentTypeAndCategories = z.infer<typeof documentTypeAndCategoriesSchema>;

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

export const executionStatusSchema = z.enum(["pending", "processing", "completed", "failed"]);
export type ExecutionStatus = z.infer<typeof executionStatusSchema>;

export const workflowExecutionWithFilesSchema = z.object({
    id: z.string(),
    workflowId: z.string(),
    status: executionStatusSchema,
    startedAt: z.date(),
    completedAt: z.date().nullable(),
    createdAt: z.date(),
    ownerId: z.string(),
    files: z.array(
        z.object({
            id: z.string(),
            fileId: z.string(),
            extractionResult: z.string().nullable(),
            status: executionStatusSchema,
            errorMessage: z.string().nullable(),
            createdAt: z.date(),
            filename: z.string(),
        }),
    ),
});

export type WorkflowExecutionWithFiles = z.infer<typeof workflowExecutionWithFilesSchema>;
