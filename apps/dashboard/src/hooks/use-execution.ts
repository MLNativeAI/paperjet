import type { WorkflowExecutionData } from "@paperjet/engine/types";
import { useQuery } from "@tanstack/react-query";
import { getExecutionById } from "@/lib/api/executions";

export function useExecution(executionId: string) {
  const {
    data: execution,
    isLoading,
    error,
    refetch,
  } = useQuery<WorkflowExecutionData>({
    queryKey: ["execution", executionId],
    queryFn: () => getExecutionById(executionId),
    enabled: !!executionId,
  });

  return {
    execution,
    isLoading,
    error,
    refetch,
  };
}
