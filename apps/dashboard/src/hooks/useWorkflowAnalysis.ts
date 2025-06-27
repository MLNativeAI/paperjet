import { useQuery } from "@tanstack/react-query";

export function useWorkflowAnalysis(workflowId: string) {
    const { data: analysisData } = useQuery({
        queryKey: ["workflow-analysis", workflowId],
        queryFn: async () => {
            const response = await fetch(`/api/workflows/${workflowId}/analysis-status`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch analysis status");
            }

            return response.json();
        },
        enabled: !!workflowId && workflowId.length > 0,
        refetchInterval: (data) => {
            return data?.analysisComplete ? false : 2000;
        },
    });

    return {
        analysisData,
        isAnalysisComplete: analysisData?.analysisComplete ?? false,
    };
}
