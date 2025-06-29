import { useNavigate } from "@tanstack/react-router";
import {
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    MoreVertical,
    Play,
    Search,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const [statusFilter, setStatusFilter] = useState<ExecutionStatus | "all">("all");

    const { runs, isLoading, exportRun, formatDuration } = useRuns();

    const filteredRuns = runs.filter((run) => {
        const matchesSearch =
            run.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            run.filename?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || run.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: ExecutionStatus) => {
        switch (status) {
            case "pending":
                return <Clock className="h-4 w-4 text-muted-foreground" />;
            case "processing":
                return (
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                );
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "failed":
                return <XCircle className="h-4 w-4 text-red-600" />;
        }
    };

    const getStatusColor = (status: ExecutionStatus) => {
        switch (status) {
            case "pending":
                return "secondary";
            case "processing":
                return "default";
            case "completed":
                return "default";
            case "failed":
                return "destructive";
        }
    };

    if (isLoading) {
        return (
            <div className="w-full px-4 py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading runs...</span>
                </div>
            </div>
        );
    }

    const totalRuns = runs.length;
    const completedRuns = runs.filter((r) => r.status === "completed").length;
    const failedRuns = runs.filter((r) => r.status === "failed").length;
    const totalFilesProcessed = runs.length; // Each run is now one file

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Runs</h1>
                    <p className="text-muted-foreground mt-2">Recent workflow executions across all workflows</p>
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
                                <p className="text-2xl font-bold text-green-600">{completedRuns}</p>
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

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Runs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
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
                                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                                    Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>Failed</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                                    Processing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
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
                        <div className="space-y-2">
                            {filteredRuns.map((run) => {
                                return (
                                    <Card key={run.id} className="border">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(run.status)}
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium">{run.workflowName}</h3>
                                                            <Badge variant={getStatusColor(run.status)}>
                                                                {run.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(run.startedAt).toLocaleString()}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="h-3 w-3" />
                                                                {run.filename}
                                                            </span>
                                                            <span>
                                                                {formatDuration(run.startedAt, run.completedAt)}
                                                            </span>
                                                        </div>
                                                        {run.errorMessage && (
                                                            <div className="text-sm text-red-600 mt-1">
                                                                Error: {run.errorMessage}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    navigate({ to: `/executions/${run.id}` })
                                                                }
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            {run.status === "completed" && run.extractionResult && (
                                                                <DropdownMenuItem
                                                                    onClick={() => exportRun(run)}
                                                                >
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Export Results
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
