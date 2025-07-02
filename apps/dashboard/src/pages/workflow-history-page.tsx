import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, CheckCircle, Clock, Download, Eye, FileText, Filter, MoreVertical, Play, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExecutions } from "@/hooks/useExecutions";
import { useWorkflow } from "@/hooks/useWorkflow";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

export default function WorkflowHistoryPage() {
    const { workflowId } = useParams({
        from: "/_app/workflows/$workflowId/history",
    });
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ExecutionStatus | "all">("all");

    const { workflow, isLoading: workflowLoading } = useWorkflow(workflowId);
    const { executions, isLoading: executionsLoading, exportExecution, formatDuration } = useExecutions(workflowId);

    const filteredExecutions = executions.filter((execution) => {
        const matchesSearch = execution.filename?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || execution.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: ExecutionStatus) => {
        switch (status) {
            case "pending":
                return <Clock className="h-4 w-4 text-muted-foreground" />;
            case "processing":
                return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
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

    if (workflowLoading || executionsLoading) {
        return (
            <div className="w-full px-4 py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading execution history...</span>
                </div>
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="w-full px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Workflow not found</h1>
                    <Button onClick={() => navigate({ to: "/" })}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Workflows
                    </Button>
                </div>
            </div>
        );
    }

    const totalExecutions = executions.length;
    const completedExecutions = executions.filter((e) => e.status === "completed").length;
    const failedExecutions = executions.filter((e) => e.status === "failed").length;
    const totalFilesProcessed = executions.length; // Each execution is now one file

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate({ to: "/" })} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Workflows
                    </Button>
                    <h1 className="text-3xl font-bold">Execution History</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground">{workflow.name}</span>
                    </div>
                </div>

                <Button onClick={() => navigate({ to: `/workflows/${workflowId}/run` })}>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Workflow
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-2xl font-bold">{totalExecutions}</p>
                                <p className="text-xs text-muted-foreground">Total Executions</p>
                            </div>
                            <Play className="h-4 w-4 text-muted-foreground ml-auto" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-2xl font-bold text-green-600">{completedExecutions}</p>
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
                                <p className="text-2xl font-bold text-red-600">{failedExecutions}</p>
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
                    <CardTitle>Execution History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by filename..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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
                                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>Failed</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("processing")}>Processing</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {filteredExecutions.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No executions found</h3>
                            <p className="text-muted-foreground mb-4">
                                {executions.length === 0 ? "No executions have been run for this workflow yet." : "No executions match your current filters."}
                            </p>
                            {executions.length === 0 && (
                                <Button onClick={() => navigate({ to: `/workflows/${workflowId}/run` })}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Run First Execution
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Started</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExecutions.map((execution) => {
                                    return (
                                        <TableRow key={execution.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(execution.status)}
                                                    <Badge variant={getStatusColor(execution.status)}>{execution.status}</Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="font-medium">{execution.filename}</p>
                                                    {execution.status === "completed" && execution.extractionResult && (
                                                        <p className="text-green-600">Extracted</p>
                                                    )}
                                                    {execution.status === "failed" && execution.errorMessage && (
                                                        <p className="text-red-600 truncate max-w-xs">{execution.errorMessage}</p>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {new Date(execution.startedAt).toLocaleString()}
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-sm">{formatDuration(execution.startedAt, execution.completedAt)}</TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => navigate({ to: `/executions/${execution.id}` })}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {execution.status === "completed" && execution.extractionResult && (
                                                            <DropdownMenuItem onClick={() => exportExecution(execution)}>
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Export Results
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
