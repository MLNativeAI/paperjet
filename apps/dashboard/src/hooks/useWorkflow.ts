import type { ExtractionField, ExtractionTable } from "@paperjet/db/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { extractData as extractDataApi, getAnalysisStatus as getAnalysisStatusApi, getWorkflow, updateWorkflow as updateWorkflowApi } from "@/lib/api";

export function useWorkflow(workflowId: string) {
    const navigate = useNavigate();

    const { data: workflow, isLoading } = useQuery({
        queryKey: ["workflow", workflowId],
        queryFn: () => getWorkflow(workflowId),
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

    const updateWorkflow = useMutation({
        mutationFn: (data: { name: string; fields: ExtractionField[]; description?: string; isPublic?: boolean }) => updateWorkflowApi(workflowId, data),
        onSuccess: () => {
            toast.success("Workflow updated successfully!");
            navigate({ to: "/" });
        },
        onError: () => {
            toast.error("Failed to update workflow");
        },
    });

    const extractData = useMutation({
        mutationFn: (data: { fileId: string; fields?: ExtractionField[]; tables?: ExtractionTable[] }) => extractDataApi(workflowId, data),
        onError: () => {
            toast.error("Failed to extract data from document");
        },
    });

    const getAnalysisStatus = useQuery({
        queryKey: ["workflow-analysis", workflowId],
        queryFn: () => getAnalysisStatusApi(workflowId),
        enabled: !!workflowId,
        refetchInterval: (query) => {
            return query.state.data?.analysisComplete ? false : 2000;
        },
    });

    return {
        workflow,
        isLoading,
        updateWorkflow,
        extractData,
        analysisStatus: getAnalysisStatus.data,
        isAnalysisComplete: getAnalysisStatus.data?.analysisComplete ?? false,
        isAnalysisLoading: getAnalysisStatus.isLoading,
    };
}
