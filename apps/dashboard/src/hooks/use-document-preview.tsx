import type { ExecutionRoutes } from "@paperjet/api/routes";
import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";

const executionClient = hc<ExecutionRoutes>("/api/v1/executions");

export function useDocumentPreview(workflowExecutionId: string) {
  const {
    data: documentUrl,
    isLoading,
    error,
    refetch,
  } = useQuery<string>({
    queryKey: ["file", workflowExecutionId],
    queryFn: async () => {
      const response = await executionClient[":executionId"].file.$get({
        param: { executionId: workflowExecutionId },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch document url");
      }
      const responseData = await response.json();
      return responseData.documentUrl;
    },
  });

  return {
    documentUrl,
    isLoading,
    error,
    refetch,
  };
}
