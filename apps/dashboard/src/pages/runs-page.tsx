import type { WorkflowRun } from "@paperjet/engine/types";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  FileText,
  Filter,
  Play,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { RunsDataTable } from "@/components/runs-data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useRuns } from "@/hooks/use-runs";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

export default function RunsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | "all">(
    "all",
  );

  const { runs, isLoading, exportRun, formatDuration, deleteRun } = useRuns();

  const filteredRuns = runs.filter((run: WorkflowRun) => {
    const matchesSearch =
      run.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (run.filename?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2">Loading runs...</span>
        </div>
      </div>
    );
  }

  const totalRuns = runs.length;
  const completedRuns = runs.filter(
    (r: WorkflowRun) => r.status === "completed",
  ).length;
  const failedRuns = runs.filter(
    (r: WorkflowRun) => r.status === "failed",
  ).length;
  const totalFilesProcessed = runs.length; // Each run is now one file

  return (
    <div className="w-full px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Runs</h1>
          <p className="text-muted-foreground mt-2">
            Recent workflow executions across all workflows
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-2xl font-bold">{totalRuns}</p>
                <p className="text-xs text-muted-foreground">Total Runs</p>
              </div>
              <Play className="h-4 w-4 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {completedRuns}
                </p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-2xl font-bold text-red-600">{failedRuns}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
              <XCircle className="h-4 w-4 text-red-600 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-2xl font-bold">{totalFilesProcessed}</p>
                <p className="text-xs text-muted-foreground">Files Processed</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Runs Data Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Runs</h2>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by workflow or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Status: {statusFilter === "all" ? "All" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {filteredRuns.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No runs found</h3>
            <p className="text-muted-foreground mb-4">
              {runs.length === 0
                ? "No workflow runs have been executed yet."
                : "No runs match your current filters."}
            </p>
            {runs.length === 0 && (
              <Button onClick={() => navigate({ to: "/" })}>
                <Play className="h-4 w-4 mr-2" />
                View Workflows
              </Button>
            )}
          </div>
        ) : (
          <RunsDataTable
            data={filteredRuns}
            onExportRun={exportRun}
            onDeleteRun={deleteRun}
            formatDuration={formatDuration}
          />
        )}
      </div>
    </div>
  );
}
