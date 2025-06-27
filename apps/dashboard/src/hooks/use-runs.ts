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

interface WorkflowRun {
    id: string;
    workflowId: string;
    workflowName: string;
    status: ExecutionStatus;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    files: ExecutionFile[];
}

export function useRuns() {
    const {
        data: runs = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["runs"],
        queryFn: async () => {
            const response = await fetch("/api/executions", {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch runs");
            }
            return response.json() as WorkflowRun[];
        },
    });

    const exportRun = (run: WorkflowRun) => {
        const results = run.files
            .filter((f) => f.status === "completed" && f.extractionResult)
            .map((f) => ({
                filename: f.filename,
                extractionResult: JSON.parse(f.extractionResult!),
            }));

        const dataStr = JSON.stringify(
            {
                runId: run.id,
                workflowId: run.workflowId,
                workflowName: run.workflowName,
                executedAt: run.startedAt,
                results,
            },
            null,
            2,
        );

        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `run-${run.id}.json`;
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
        runs,
        isLoading,
        refetch,
        exportRun,
        formatDuration,
    };
}
