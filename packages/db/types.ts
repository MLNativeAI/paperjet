import { z } from "zod";
import type { file, workflow, workflowFile } from "./schema";

export const uploadFileSchema = z.object({
  file: z.instanceof(File),
  name: z.string(),
});

export type FileData = typeof file.$inferSelect;

export type FileDataWithPresignedUrl = FileData & {
  presignedUrl: string;
};

// Workflow types
export type WorkflowData = typeof workflow.$inferSelect;
export type WorkflowFileData = typeof workflowFile.$inferSelect;

// Field extraction configuration
export const fieldTypeSchema = z.enum(["text", "number", "date", "currency", "boolean"]);

export const extractionFieldSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: fieldTypeSchema,
  required: z.boolean().default(false),
});

export const extractionTableSchema = z.object({
  name: z.string(),
  description: z.string(),
  columns: z.array(extractionFieldSchema),
});

export const workflowConfigurationSchema = z.object({
  fields: z.array(extractionFieldSchema),
  tables: z.array(extractionTableSchema),
});

export type ExtractionField = z.infer<typeof extractionFieldSchema>;
export type ExtractionTable = z.infer<typeof extractionTableSchema>;
export type WorkflowConfiguration = z.infer<typeof workflowConfigurationSchema>;

// Document analysis result
export const documentAnalysisSchema = z.object({
  documentType: z.string(),
  confidence: z.number().min(0).max(1),
  suggestedFields: z.array(extractionFieldSchema),
  suggestedTables: z.array(extractionTableSchema),
});

export type DocumentAnalysis = z.infer<typeof documentAnalysisSchema>;
