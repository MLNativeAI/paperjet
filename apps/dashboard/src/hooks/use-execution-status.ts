import type { ExecutionRoutes } from "@paperjet/api/routes";
import type { ExecutionStatusResponse } from "@paperjet/engine/types";
import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import { useState } from "react";

const executionClient = hc<ExecutionRoutes>("/api/v1/executions");

export function useExecutionStatus(executionId: string) {
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatusResponse | null>(null);

  const {
    data: statusResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<ExecutionStatusResponse>({
    queryKey: ["execution-status", executionId],
    queryFn: async () => {
      const response = await executionClient[":executionId"].status.$get({
        param: { executionId },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch execution status");
      }
      const responseData = await response.json();
      setExecutionStatus(responseData);
      return responseData;
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
    enabled: () => {
      if (!executionStatus) {
        return true;
      }
      return !(executionStatus.status === "Failed" || executionStatus.status === "Completed");
    },
  });

  return {
    statusResponse,
    isLoading,
    error,
    refetch,
  };
}
