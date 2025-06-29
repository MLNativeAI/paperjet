import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

interface ExecutionFile {
    id: string;
    fileId: string;
    extractionResult: string | null;
    status: ExecutionStatus;
    errorMessage: string | null;
    createdAt: string;
    filename: string;
}

interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: ExecutionStatus;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    files: ExecutionFile[];
}

export function useExecutions(workflowId: string) {
    const {
        data: executions = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["executions", workflowId],
        queryFn: async () => {
            const response = await fetch(`/api/executions/workflow/${workflowId}`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch executions");
            }
            return response.json() as WorkflowExecution[];
        },
    });

    const exportExecution = (execution: WorkflowExecution) => {
        const results = execution.files
            .filter((f) => f.status === "completed" && f.extractionResult)
            .map((f) => ({
                filename: f.filename,
                extractionResult: JSON.parse(f.extractionResult ?? "{}"),
            }));

        const dataStr = JSON.stringify(
            {
                executionId: execution.id,
                workflowId: execution.workflowId,
                executedAt: execution.startedAt,
                results,
            },
            null,
            2,
        );

        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `execution-${execution.id}.json`;
        link.click();

        URL.revokeObjectURL(url);
        toast.success("Results exported successfully");
    };

    const formatDuration = (startedAt: string, completedAt: string | null) => {
        if (!completedAt) return "In progress";

        const start = new Date(startedAt);
        const end = new Date(completedAt);
        const diffMs = end.getTime() - start.getTime();
        const diffSeconds = Math.round(diffMs / 1000);

        if (diffSeconds < 60) return `${diffSeconds}s`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m`;
        const diffHours = Math.round(diffMinutes / 60);
        return `${diffHours}h`;
    };

    return {
        executions,
        isLoading,
        refetch,
        exportExecution,
        formatDuration,
    };
}
