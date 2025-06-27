import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

interface UploadedFile {
    file: File;
    id: string;
    status: ExecutionStatus;
    result?: any;
    error?: string;
}

export function useWorkflowExecution(workflowId: string) {
    const executeWorkflow = useMutation({
        mutationFn: async (files: File[]) => {
            const formData = new FormData();
            formData.append("workflowId", workflowId);
            files.forEach((file) => formData.append("files", file));

            const response = await fetch("/api/executions", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to execute workflow");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success("Workflow execution completed!");
        },
        onError: (error) => {
            toast.error("Failed to execute workflow");
            console.error("Execution error:", error);
        },
    });

    const exportResults = (uploadedFiles: UploadedFile[], executionId: string | null) => {
        const results = uploadedFiles
            .filter((f) => f.status === "completed" && f.result)
            .map((f) => ({
                filename: f.file.name,
                extractionResult: f.result,
            }));

        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `workflow-execution-${executionId || "results"}.json`;
        link.click();

        URL.revokeObjectURL(url);
        toast.success("Results exported successfully");
    };

    return {
        executeWorkflow,
        exportResults,
    };
}
