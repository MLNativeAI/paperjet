import type { ApiRoutes } from "@api/index";
import type { ExtractedTable, ExtractedValue } from "@paperjet/engine/types";
import { hc } from "hono/client";

const client = hc<ApiRoutes>("/");

export const api = client.api;

// Workflow API functions
export const getWorkflow = async (workflowId: string) => {
    const response = await api.workflows[":id"].$get({
        param: { id: workflowId },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch workflow");
    }

    return response.json();
};

// export const updateWorkflow = async (
//     workflowId: string,
//     data: {
//         name: string;
//         fields: ExtractionField[];
//         description?: string;
//         isPublic?: boolean;
//     },
// ) => {
//     const response = await api.workflows[":id"].$put({
//         param: { id: workflowId },
//         json: {
//             name: data.name,
//             fields: data.fields,
//             description: data.description,
//             isPublic: data.isPublic,
//         },
//     });

//     if (!response.ok) {
//         throw new Error("Failed to update workflow");
//     }

//     return response.json();
// };

// export const extractData = async (
//     workflowId: string,
//     data: {
//         fileId: string;
//         fields?: ExtractionField[];
//         tables?: ExtractionTable[];
//     },
// ) => {
//     const response = await api.workflows[":id"].extract.$post({
//         param: { id: workflowId },
//         json: {
//             fileId: data.fileId,
//             fields: data.fields,
//             tables: data.tables,
//         },
//     });

//     if (!response.ok) {
//         throw new Error("Failed to extract data");
//     }

//     return response.json();
// };

export const getAnalysisStatus = async (workflowId: string) => {
    const response = await api.workflows[":id"].$get({
        param: { id: workflowId },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch analysis status");
    }

    return response.json();
};

export const analyzeWorkflow = async (workflowId: string) => {
    const response = await api.workflows[":id"].analyze.$post({
        param: { id: workflowId },
    });

    if (!response.ok) {
        throw new Error("Failed to analyze workflow");
    }

    return response.json();
};

// Workflow list API functions
export const getAllWorkflows = async () => {
    const response = await api.workflows.$get();
    if (!response.ok) {
        throw new Error("Failed to fetch workflows");
    }
    return response.json();
};

export const deleteWorkflow = async (workflowId: string) => {
    const response = await api.workflows[":id"].$delete({
        param: { id: workflowId },
    });

    if (!response.ok) {
        throw new Error("Failed to delete workflow");
    }

    return response.json();
};

// Execution API functions
export const getAllExecutions = async () => {
    const response = await api.executions.$get();
    if (!response.ok) {
        throw new Error("Failed to fetch executions");
    }
    return response.json();
};

export const getWorkflowExecutions = async (workflowId: string) => {
    const response = await api.executions.workflow[":workflowId"].$get({
        param: { workflowId },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch executions");
    }
    return response.json();
};

export const getExecutionDetails = async (executionId: string) => {
    const response = await api.executions[":executionId"].$get({
        param: { executionId },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch execution details");
    }
    return response.json();
};

export const deleteExecution = async (executionId: string) => {
    const response = await api.executions[":executionId"].$delete({
        param: { executionId },
    });
    if (!response.ok) {
        throw new Error("Failed to delete execution");
    }
    return response.json();
};

// FormData functions that can't use Hono RPC
export const createWorkflowFromFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/workflows", {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to create workflow from file");
    }

    return response.json();
};

export const executeWorkflowBulk = async (workflowId: string, files: File[]) => {
    const formData = new FormData();
    formData.append("workflowId", workflowId);
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/executions/bulk", {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to execute workflow");
    }

    return response.json();
};

// Document API functions
export const getDocument = async (fileId: string) => {
    const response = await api.workflows[":fileId"].document.$get({
        param: { fileId },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch document");
    }

    return response.json();
};
