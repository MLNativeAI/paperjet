import type { WorkflowExecutionStatus } from "@paperjet/db/types";
import type { Workflow } from "@paperjet/engine/types";
import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import ExecutionStatusRow from "@/components/workflow/execution/execution-status-row";
import { useWorkflowExecution } from "@/hooks/use-workflow-execution";
import { useBilling } from "@/hooks/use-billing";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

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
  const { hasActiveSubscription, isLoading } = useBilling();

  const { executeWorkflow } = useWorkflowExecution(workflow.id);
  const handleFileUpload = async (files: FileList) => {
    if (!hasActiveSubscription) {
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
      {!hasActiveSubscription && !isLoading && (
        <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
          <p className="text-muted-foreground mb-4">You need an active plan to execute workflows.</p>
          <Button asChild>
            <Link to="/settings/billing">Upgrade Plan</Link>
          </Button>
        </div>
      )}
      {hasActiveSubscription && <FileUpload onFileUpload={handleFileUpload} />}
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
