import type { ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useWorkflow(workflowId: string) {
    const navigate = useNavigate();

    const { data: workflow, isLoading } = useQuery({
        queryKey: ["workflow", workflowId],
        queryFn: async () => {
            const response = await api.workflows[":id"].$get({
                param: { id: workflowId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch workflow");
            }

            return response.json();
        },
        enabled: !!workflowId,
    });

    const updateWorkflow = useMutation({
        mutationFn: async ({
            name,
            configuration,
        }: {
            name: string;
            configuration: { fields: ExtractionField[]; tables: ExtractionTable[] };
        }) => {
            const response = await fetch(`/api/workflows/${workflowId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    configuration,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update workflow");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success("Workflow updated successfully!");
            navigate({ to: "/" });
        },
        onError: () => {
            toast.error("Failed to update workflow");
        },
    });

    const extractData = useMutation({
        mutationFn: async ({
            fileId,
            fields,
            tables,
        }: {
            fileId: string;
            fields: ExtractionField[];
            tables: ExtractionTable[];
        }) => {
            const response = await fetch(`/api/workflows/${workflowId}/extract`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    fileId,
                    fields,
                    tables,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to extract data");
            }

            return response.json();
        },
        onError: () => {
            toast.error("Failed to extract data from document");
        },
    });

    const createWorkflowFromFile = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/workflows", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to create workflow from file");
            }
            return response.json();
        },
        onError: () => {
            toast.error("Failed to create workflow from file");
        },
    });

    const analyzeWorkflow = useMutation({
        mutationFn: async (workflowId: string) => {
            const response = await fetch(`/api/workflows/${workflowId}/analyze`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to analyze workflow");
            }
            return response.json();
        },
        onError: () => {
            toast.error("Failed to analyze document");
        },
    });

    const getAnalysisStatus = useQuery({
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
        enabled: !!workflowId,
        refetchInterval: (data) => {
            return data?.analysisComplete ? false : 2000;
        },
    });

    return {
        workflow,
        isLoading,
        updateWorkflow,
        extractData,
        createWorkflowFromFile,
        analyzeWorkflow,
        analysisStatus: getAnalysisStatus.data,
        isAnalysisComplete: getAnalysisStatus.data?.analysisComplete ?? false,
        isAnalysisLoading: getAnalysisStatus.isLoading,
    };
}
