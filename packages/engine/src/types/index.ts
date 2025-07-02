// Re-export types from @paperjet/db/types for convenience
export type {
    DocumentAnalysis,
    FileDataWithPresignedUrl,
} from "@paperjet/db/types";

// Import and re-export types that may have import issues
import type {
    ExtractionResult as DbExtractionResult,
    WorkflowConfiguration as DbWorkflowConfiguration,
} from "@paperjet/db/types";
export type ExtractionResult = DbExtractionResult;
export type WorkflowConfiguration = DbWorkflowConfiguration;

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
