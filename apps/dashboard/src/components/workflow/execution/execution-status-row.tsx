import { IconEye } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getStatusIcon, getStatusText } from "@/components/utils";
import { useExecutionStatus } from "@/hooks/use-execution-status";
import type { ExecutionResult } from "@/pages/workflow-executor-page";

export default function ExecutionStatusRow({ execution }: { execution: ExecutionResult }) {
  const { statusResponse } = useExecutionStatus(execution.workflowExecutionId);

  const navigate = useNavigate();
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {execution.fileName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon(statusResponse?.status || execution.status)}
            <span className="text-sm font-medium">{getStatusText(statusResponse?.status || execution.status)}</span>
            {statusResponse?.status && statusResponse.status === "Completed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: `/executions/${execution.workflowExecutionId}` })}
              >
                <IconEye className="h-4 w-4 mr-2" />
                View
              </Button>
            )}
            {statusResponse?.status && statusResponse.status === "Failed" && (
              <Label>Unfortunately, this execution has failed. Please try again later.</Label>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Execution ID: {execution.workflowExecutionId}</span>
          {execution.createdAt && <span>Started: {new Date(execution.createdAt).toLocaleTimeString()}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
