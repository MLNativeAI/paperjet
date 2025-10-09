import type { ExecutionRoutes } from "@paperjet/api/routes";
import type { WorkflowExecutionData, WorkflowExecutionRow } from "@paperjet/db/types";
import { hc, type InferResponseType } from "hono/client";

const executionClient = hc<ExecutionRoutes>("/api/v1/executions");

export type ExecutionList = InferResponseType<typeof executionClient.index.$get>;

export const getAllExecutions = async (): Promise<WorkflowExecutionRow[]> => {
  const response = await executionClient.index.$get();
  if (!response.ok) {
    throw new Error("Failed to fetch executions");
  }

  const data = await response.json();
  return data;
};

export const getExecutionById = async (executionId: string): Promise<WorkflowExecutionData> => {
  const response = await executionClient[":executionId"].$get({
    param: { executionId },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch execution");
  }
  return response.json();
};

export const exportExecution = async (executionId: string, mode: "json" | "csv") => {
  const response = await executionClient[":executionId"].export.$get({
    param: { executionId },
    query: { mode },
  });

  if (!response.ok) {
    throw new Error("Failed to export execution");
  }

  // Get the filename from Content-Disposition header
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `execution_${executionId}.${mode}`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) {
      filename = match[1];
    }
  }

  // Get the blob from response
  const blob = await response.blob();

  // Create a download link and trigger download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
