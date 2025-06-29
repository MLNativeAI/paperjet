import { useQuery } from "@tanstack/react-query";
import { getAnalysisStatus } from "@/lib/api";

export function useWorkflowAnalysis(workflowId: string) {
    const { data: analysisData } = useQuery({
        queryKey: ["workflow-analysis", workflowId],
        queryFn: () => getAnalysisStatus(workflowId),
        enabled: !!workflowId && workflowId.length > 0,
        refetchInterval: (query) => {
            return query.state.data?.analysisComplete ? false : 2000;
        },
    });

    return {
        analysisData,
        isAnalysisComplete: analysisData?.analysisComplete ?? false,
    };
}
