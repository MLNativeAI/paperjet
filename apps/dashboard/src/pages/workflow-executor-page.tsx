import type { WorkflowExecutionStatus } from "@paperjet/db/types";
import type { Workflow } from "@paperjet/engine/types";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import ExecutionStatusRow from "@/components/workflow/execution/execution-status-row";
import { usePlan } from "@/hooks/use-plan";
import { useWorkflowExecution } from "@/hooks/use-workflow-execution";

export interface ExecutionResult {
  workflowExecutionId: string;
  workflowId: string;
  fileName: string;
  fileId: string;
  createdAt?: string;
  status: WorkflowExecutionStatus;
}

interface WorkflowExecutorPageProps {
  workflow: Workflow;
}

export default function WorkflowExecutorPage({ workflow }: WorkflowExecutorPageProps) {
  const [executions, setExecutions] = useState<ExecutionResult[]>([]);
  const { hasActivePlan, isLoading } = usePlan();

  const { executeWorkflow } = useWorkflowExecution(workflow.id);
  const handleFileUpload = async (files: FileList) => {
    if (!hasActivePlan) {
      return;
    }

    const fileArray = Array.from(files);
    try {
      const executionPromises = fileArray.map((file) => executeWorkflow.mutateAsync(file));
      const results = await Promise.all(executionPromises);

      // Add executions to local state
      const newExecutions: ExecutionResult[] = results.map((execution: any, index: number) => ({
        workflowExecutionId: execution.workflowExecutionId,
        workflowId: execution.workflowId,
        fileName: fileArray[index]?.name || `File ${index + 1}`,
        fileId: execution.fileId,
        createdAt: new Date().toISOString(),
        status: execution.status,
      }));
      setExecutions((prev) => [...newExecutions, ...prev]);
    } catch (error) {
      // Errors are handled in the useWorkflowExecution hook with appropriate toasts
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="w-full px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Execute: {workflow.name}</h1>
          <p className="text-muted-foreground mt-2">
            {workflow.description || "Upload documents to process with this workflow. Supports PDF files and images."}
          </p>
        </div>
      </div>
      {!hasActivePlan && !isLoading && (
        <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
          <p className="text-muted-foreground mb-4">You need an active plan to execute workflows.</p>
          <Button asChild>
            <Link to="/settings/billing">Upgrade Plan</Link>
          </Button>
        </div>
      )}
      {hasActivePlan && <FileUpload onFileUpload={handleFileUpload} />}
      {executions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Processing Status</h2>
          <div className="grid gap-4">
            {executions.map((execution) => (
              <ExecutionStatusRow key={execution.workflowExecutionId} execution={execution} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
