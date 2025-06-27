import { useQuery } from "@tanstack/react-query";

export function useWorkflowExecutions(workflowId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ["workflow-executions", workflowId],
        queryFn: async () => {
            const response = await fetch(`/api/executions/workflow/${workflowId}`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch executions");
            }
            return response.json();
        },
        enabled: enabled && !!workflowId,
    });
}
