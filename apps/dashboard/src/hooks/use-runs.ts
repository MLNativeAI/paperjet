import type { WorkflowRun } from "@paperjet/engine/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteExecution, getAllExecutions } from "@/lib/api";

export function useRuns() {
  const queryClient = useQueryClient();

  const {
    data: runs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["runs"],
    queryFn: getAllExecutions,
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

  const deleteRun = (run: WorkflowRun) => {
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
