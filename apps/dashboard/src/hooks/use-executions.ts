import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllExecutions } from "@/lib/api/executions";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

interface WorkflowExecution {
  id: string;
  workflowId: string;
  fileId: string;
  status: ExecutionStatus;
  extractionResult: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  filename: string;
}

export function useExecutions() {
  const {
    data: executions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["executions"],
    queryFn: () => getAllExecutions(),
  });

  const exportExecution = (execution: WorkflowExecution) => {
    if (execution.status !== "completed" || !execution.extractionResult) {
      toast.error("No results to export");
      return;
    }

    const dataStr = JSON.stringify(
      {
        executionId: execution.id,
        workflowId: execution.workflowId,
        executedAt: execution.startedAt,
        filename: execution.filename,
        extractionResult: execution.extractionResult,
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
