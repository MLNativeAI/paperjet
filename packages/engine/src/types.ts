import type { DbWorkflow, FileData } from "@paperjet/db/types";
import type { ExtractionResult } from "@paperjet/db/types";
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
        name: z.string(),
        description: z.string(),
        type: z.enum(["text", "number", "date", "currency", "boolean"]),
        required: z.boolean(),
        categoryId: z.string(),
    }),
);

export type FieldsConfiguration = z.infer<typeof fieldsConfigurationSchema>;

export const tableConfigurationSchema = z.array(
    z.object({
        columns: z.array(
            z.object({
                name: z.string(),
                description: z.string(),
                type: z.enum(["text", "number", "date", "currency", "boolean"]),
            }),
        ),
        name: z.string(),
        description: z.string(),
        categoryId: z.string(),
    }),
);

export type TableConfiguration = z.infer<typeof tableConfigurationSchema>;

export const workflowConfigurationSchema = z.object({
    fields: fieldsConfigurationSchema,
    tables: tableConfigurationSchema,
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

export type Workflow = Omit<DbWorkflow, "configuration" | "sampleData" | "categories"> & {
    configuration: WorkflowConfiguration;
    categories: CategoriesConfiguration;
    sampleData?: ExtractionResult | null;
};

export type FileDataWithPresignedUrl = FileData & {
    presignedUrl: string;
};
