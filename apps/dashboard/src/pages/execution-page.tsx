import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, FileJson, FileText, Grid, LayoutPanelLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/document-preview";
import { ExecutionStatusBadge } from "@/components/execution-status-badge";
import { ExtractedDataRenderer } from "@/components/extracted-data-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useExecution } from "@/hooks/use-execution";
import { exportExecution } from "@/lib/api/executions";
import { formatDuration } from "@/lib/utils/date";

export default function ExecutionPage() {
  const { executionId } = useParams({ from: "/_app/executions/$executionId" });
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"results" | "compare">("compare");

  const { execution, isLoading, error } = useExecution(executionId);

  const handleExport = async (mode: "json" | "csv") => {
    setIsExporting(true);
    try {
      await exportExecution(executionId, mode);
      toast.success(`Exported as ${mode.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export execution");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="w-full px-4 py-8">Loading execution...</div>;
  }

  if (error) {
    return <div className="w-full px-4 py-8">Error loading execution: {error.message}</div>;
  }

  if (!execution) {
    return <div className="w-full px-4 py-8">Execution not found</div>;
  }

  return (
    <div className="w-full px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate({ to: "/executions" })} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Executions
          </Button>
          <h1 className="text-3xl font-bold">Execution Details</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-muted-foreground">{execution.workflowName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Label>View mode</Label>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              onClick={() => setViewMode("compare")}
              variant={viewMode === "results" ? "ghost" : "secondary"}
              size="sm"
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4 mr-1" />
              Compare
            </Button>
            <Button
              onClick={() => setViewMode("results")}
              variant={viewMode === "compare" ? "ghost" : "secondary"}
              size="sm"
              className="h-8 px-3"
            >
              <LayoutPanelLeft className="h-4 w-4 mr-1" />
              Results only
            </Button>
          </div>
          {execution.status === "Completed" && execution.extractedData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export Results"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {viewMode === "results" && execution.status === "Completed" && execution.extractedData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Filename</p>
                  <p className="text-lg font-medium">{execution.fileName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <ExecutionStatusBadge status={execution.status} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-lg">{formatDuration(execution.startedAt, execution.completedAt)}</p>
                </div>
                {execution.errorMessage && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Message</p>
                    <p className="text-sm text-red-600">{execution.errorMessage}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <ExtractedDataRenderer data={execution.extractedData} />
        </>
      )}
      {viewMode === "compare" && execution.status === "Completed" && execution.extractedData && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Filename</p>
                    <p className="text-lg font-medium">{execution.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <ExecutionStatusBadge status={execution.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-lg">{formatDuration(execution.startedAt, execution.completedAt)}</p>
                  </div>
                  {execution.errorMessage && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Error Message</p>
                      <p className="text-sm text-red-600">{execution.errorMessage}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <ExtractedDataRenderer data={execution.extractedData} />
          </div>
          <DocumentPreview workflowExecutionId={execution.id} />
        </div>
      )}
    </div>
  );
}
