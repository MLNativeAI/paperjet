import type { ApiRoutes } from "@api/index";
import { hc } from "hono/client";

const client = hc<ApiRoutes>("/");

export const api = client.api;
export const apiClient = client;

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

export const createWorkflowFromTemplate = async (templateData: {
  slug: string;
  description: string;
  configuration: string;
  categories: string;
  sampleData: string;
  templateFile: File;
}) => {
  const formData = new FormData();
  formData.append("slug", templateData.slug);
  formData.append("description", templateData.description);
  formData.append("configuration", templateData.configuration);
  formData.append("categories", templateData.categories);
  formData.append("sampleData", templateData.sampleData);
  formData.append("templateFile", templateData.templateFile);

  const response = await fetch("/api/workflows/from-template", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to create workflow from template");
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

// Field API functions
export const updateWorkflowField = async (
  workflowId: string,
  fieldId: string,
  updates: {
    slug?: string;
    description?: string;
    type?: "text" | "number" | "date" | "currency" | "boolean";
    required?: boolean;
    categoryId?: string;
  },
) => {
  const response = await api.workflows[":id"].fields[":fieldId"].$patch({
    param: { id: workflowId, fieldId },
    json: updates,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update field");
  }

  return response.json();
};

export const createWorkflowField = async (
  workflowId: string,
  field: {
    slug: string;
    description: string;
    type: "text" | "number" | "date" | "currency" | "boolean";
    required: boolean;
    categoryId: string;
  },
) => {
  const response = await api.workflows[":id"].fields.$post({
    param: { id: workflowId },
    json: field,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create field");
  }

  return response.json();
};

export const deleteWorkflowField = async (workflowId: string, fieldId: string) => {
  const response = await api.workflows[":id"].fields[":fieldId"].$delete({
    param: { id: workflowId, fieldId },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete field");
  }

  return response.json();
};

// Re-extract API function
export const reExtractWorkflowData = async (workflowId: string) => {
  const response = await api.workflows[":id"]["re-extract"].$post({
    param: { id: workflowId },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to re-extract data");
  }

  return response.json();
};

// Table API functions
export const createWorkflowTable = async (
  workflowId: string,
  table: {
    slug: string;
    description: string;
    categoryId: string;
    columns: Array<{
      slug: string;
      description: string;
      type: "text" | "number" | "date" | "currency" | "boolean";
    }>;
  },
) => {
  const response = await api.workflows[":id"].tables.$post({
    param: { id: workflowId },
    json: table,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create table");
  }

  return response.json();
};

export const updateWorkflowTable = async (
  workflowId: string,
  tableId: string,
  updates: {
    slug?: string;
    description?: string;
    columns?: Array<{
      id?: string;
      slug: string;
      description: string;
      type: "text" | "number" | "date" | "currency" | "boolean";
    }>;
    categoryId?: string;
  },
) => {
  const response = await api.workflows[":id"].tables[":tableId"].$patch({
    param: { id: workflowId, tableId },
    json: updates,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update table");
  }

  return response.json();
};

export const deleteWorkflowTable = async (workflowId: string, tableId: string) => {
  const response = await api.workflows[":id"].tables[":tableId"].$delete({
    param: { id: workflowId, tableId },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete table");
  }

  return response.json();
};

// Update workflow basic data
export const updateWorkflowBasicData = async (
  workflowId: string,
  data: {
    slug: string;
    description?: string;
  },
) => {
  const response = await api.workflows[":id"]["basic-data"].$patch({
    param: { id: workflowId },
    json: data,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update workflow");
  }

  return response.json();
};
