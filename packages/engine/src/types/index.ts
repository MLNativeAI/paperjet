// Re-export types from @paperjet/db/types for convenience
export type {
    FileDataWithPresignedUrl,
} from "@paperjet/db/types";

// Import and re-export types that may have import issues
import { type ExtractionResult as DbExtractionResult, } from "@paperjet/db/types";
import z from "zod";
export type ExtractionResult = DbExtractionResult;

// Engine-specific types
export interface EngineServiceDeps {
    s3: {
        presign: (filename: string) => Promise<string>;
        file: (filename: string) => {
            write: (data: ArrayBuffer) => Promise<void>;
        };
    };
}

export const categoriesConfigurationSchema = z.array(z.object({
    categoryId: z.string(),
    slug: z.string(),
    displayName: z.string(),
    ordinal: z.number(),
}));

export type CategoriesConfiguration = z.infer<typeof categoriesConfigurationSchema>;

export const fieldsConfigurationSchema = z.array(z.object({
    name: z.string(),
    description: z.string(),
    type: z.enum(["text", "number", "date", "currency", "boolean"]),
    required: z.boolean(),
    categoryId: z.string(),
}));

export type FieldsConfiguration = z.infer<typeof fieldsConfigurationSchema>;

export const tableConfigurationSchema = z.array(z.object({
    columns: z.array(z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(["text", "number", "date", "currency", "boolean"]),
    })),
    categoryId: z.string(),
}));

export type TableConfiguration = z.infer<typeof tableConfigurationSchema>;

export const workflowConfigurationSchema = z.object({
    fields: z.array(fieldsConfigurationSchema),
    tables: z.array(tableConfigurationSchema),
});

export type WorkflowConfiguration = z.infer<typeof workflowConfigurationSchema>;


export interface ExecutionFileResult {
    executionFileId: string;
    fileId: string;
    filename: string;
    status: "completed" | "failed";
    extractionResult?: ExtractionResult;
    error?: string;
}

export interface WorkflowExecutionResult {
    executionId: string;
    status: string;
    files: ExecutionFileResult[];
}
