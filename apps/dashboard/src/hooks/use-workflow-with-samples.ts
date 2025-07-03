import { getWorkflow } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Workflow } from "@paperjet/engine/types";

export function useWorkflowWithSamples(workflowId: string) {
    const {
        data: workflow,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["workflow-with-samples", workflowId],
        queryFn: () => getWorkflow(workflowId) as Promise<Workflow>,
        enabled: !!workflowId,
        // Refetch more frequently when workflow is in transitional states
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "analyzing" || status === "extracting") {
                return 2000; // Poll every 2 seconds during processing
            }
            return false; // Don't poll for other states
        },
    });

    return {
        workflow,
        isLoading,
        error,
        hasError: !!error,
    };
}
