import { useQuery } from "@tanstack/react-query";
import { getWorkflowExecutions } from "@/lib/api";

export function useWorkflowExecutions(workflowId: string, enabled = true) {
  return useQuery({
    queryKey: ["workflow-executions", workflowId],
    queryFn: () => getWorkflowExecutions(workflowId),
    enabled: enabled && !!workflowId,
  });
}
