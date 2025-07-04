import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteExecution, getAllExecutions } from "@/lib/api";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

// Local definition to avoid import issues
interface ExtractedValue {
    fieldName: string;
    value: string | number | boolean | Date | null;
    confidence: number;
}

interface ExtractedTable {
    tableName: string;
    rows: Array<{
        values: Record<string, string | number | boolean | Date | null>;
    }>;
    confidence: number;
}

interface ExtractionResult {
    fields: ExtractedValue[];
    tables: ExtractedTable[];
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

// Interface that matches what the RunsDataTable expects
export interface RunData {
    id: string;
    workflowId: string;
    workflowName: string;
    fileId: string;
    filename: string;
    status: ExecutionStatus;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    errorMessage: string | null;
    extractionResult: ExtractionResult | null;
}

export function useRuns() {
    const queryClient = useQueryClient();

    const {
        data: rawRuns = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["runs"],
        queryFn: getAllExecutions,
    });

    // Transform the raw API response to match RunData interface
    const runs: RunData[] = rawRuns.map((run: WorkflowRun) => {
        let extractionResult: ExtractionResult | null = null;
        
        if (run.extractionResult) {
            try {
                extractionResult = JSON.parse(run.extractionResult);
            } catch (error) {
                console.error("Failed to parse extraction result:", error);
                extractionResult = null;
            }
        }
        
        return {
            ...run,
            extractionResult,
        };
    });

    const deleteMutation = useMutation({
        mutationFn: deleteExecution,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["runs"] });
            toast.success("Run deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete run");
        },
    });

    const exportRun = (run: RunData) => {
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
                extractionResult: run.extractionResult,
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

    const deleteRun = (run: RunData) => {
        if (confirm(`Are you sure you want to delete this run for "${run.workflowName}"?`)) {
            deleteMutation.mutate(run.id);
        }
    };

    return {
        runs,
        isLoading,
        refetch,
        exportRun,
        formatDuration,
        deleteRun,
        isDeleting: deleteMutation.isPending,
    };
}
