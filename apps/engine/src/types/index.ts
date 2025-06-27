// Re-export types from @paperjet/db/types for convenience
export type {
    DocumentAnalysis,
    ExtractionResult,
    FileDataWithPresignedUrl,
    WorkflowConfiguration,
} from "@paperjet/db/types";

// Engine-specific types
export interface EngineServiceDeps {
    s3: {
        presign: (filename: string) => Promise<string>;
        file: (filename: string) => {
            write: (data: ArrayBuffer) => Promise<void>;
        };
    };
}

export interface WorkflowCreateData {
    name: string;
    configuration: WorkflowConfiguration;
    fileId?: string;
}

export interface WorkflowUpdateData {
    name?: string;
    configuration?: WorkflowConfiguration;
}

export interface ExtractionConfig {
    fields: Array<{
        name: string;
        description: string;
        type: "text" | "number" | "date" | "currency" | "boolean";
    }>;
    tables: Array<{
        name: string;
        description: string;
        columns: Array<{
            name: string;
            description: string;
            type: "text" | "number" | "date" | "currency" | "boolean";
        }>;
    }>;
}

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
