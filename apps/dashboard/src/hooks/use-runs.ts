import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllExecutions } from "@/lib/api";

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
    fileId: string;
    status: ExecutionStatus;
    extractionResult: string | null;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    filename: string;
}

export function useRuns() {
    const {
        data: runs = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["runs"],
        queryFn: getAllExecutions,
    });

    const exportRun = (run: WorkflowRun) => {
        if (run.status !== "completed" || !run.extractionResult) {
            toast.error("No results to export");
            return;
        }

        const dataStr = JSON.stringify(
            {
                runId: run.id,
                workflowId: run.workflowId,
                workflowName: run.workflowName,
                executedAt: run.startedAt,
                filename: run.filename,
                extractionResult: JSON.parse(run.extractionResult),
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
