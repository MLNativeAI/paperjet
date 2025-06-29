import type { ExtractedTable, ExtractedValue, ExtractionResult } from "@paperjet/db/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, Copy, Download, FileText, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/document-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

interface ExecutionDetail {
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

export default function ExecutionDetailPage() {
    const { executionId } = useParams({ from: "/_app/executions/$executionId" });
    const navigate = useNavigate();

    const { data: execution, isLoading } = useQuery({
        queryKey: ["execution", executionId],
        queryFn: async () => {
            const response = await fetch(`/api/executions/${executionId}`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch execution details");
            }
            return response.json() as ExecutionDetail;
        },
    });

    let extractionResult: ExtractionResult | null = null;
    if (execution?.extractionResult) {
        extractionResult = execution.extractionResult as ExtractionResult;
    }

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

    const formatValue = (value: string | number | boolean | Date | null, type: string) => {
        if (value === null || value === undefined) {
            return <span className="text-muted-foreground italic">No data found</span>;
        }

        switch (type) {
            case "currency":
                return typeof value === "number" ? `$${value.toFixed(2)}` : value;
            case "date":
                return value;
            case "boolean":
                return value ? "Yes" : "No";
            default:
                return value.toString();
        }
    };

    const exportResults = () => {
        if (!execution || execution.status !== "completed" || !execution.extractionResult) {
            toast.error("No results to export");
            return;
        }

        const dataStr = JSON.stringify(
            {
                executionId: execution.id,
                workflowId: execution.workflowId,
                workflowName: execution.workflowName,
                executedAt: execution.startedAt,
                filename: execution.filename,
                extractionResult: extractionResult,
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
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

    if (isLoading) {
        return (
            <div className="w-full px-4 py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading execution details...</span>
                </div>
            </div>
        );
    }

    if (!execution) {
        return (
            <div className="w-full px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Execution not found</h1>
                    <Button onClick={() => navigate({ to: "/runs" })}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Runs
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate({ to: "/runs" })} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Runs
                    </Button>
                    <h1 className="text-3xl font-bold">Execution Details</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-muted-foreground">{execution.workflowName}</span>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <Badge variant={getStatusColor(execution.status)}>{execution.status}</Badge>
                        </div>
                    </div>
                </div>

                {execution.status === "completed" && execution.extractionResult && (
                    <Button onClick={exportResults}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                    </Button>
                )}
            </div>

            {/* File Information */}
            <Card>
                <CardHeader>
                    <CardTitle>File Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Filename</p>
                            <p className="text-lg font-medium">{execution.filename}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(execution.status)}
                                <Badge variant={getStatusColor(execution.status)}>{execution.status}</Badge>
                            </div>
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

            {/* Execution Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Execution Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Execution ID</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-sm bg-muted px-2 py-1 rounded">{execution.id}</code>
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(execution.id)}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Started At</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(execution.startedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Workflow</p>
                                <p>{execution.workflowName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {execution.completedAt
                                            ? new Date(execution.completedAt).toLocaleString()
                                            : "In progress"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Processing Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {execution.status === "failed" ? (
                            <div className="h-96 flex items-center justify-center">
                                <div className="text-center">
                                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                                    <h4 className="font-semibold mb-2">Processing Failed</h4>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        {execution.errorMessage || "An error occurred while processing this file"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <DocumentPreview fileId={execution.fileId} />
                        )}
                    </CardContent>
                </Card>

                {/* Extraction Results */}
                <Card>
                    <CardHeader>
                        <CardTitle>Extracted Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {execution.status === "completed" && extractionResult ? (
                            <div className="space-y-4">
                                {/* Fields */}
                                {extractionResult.fields.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Fields</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {extractionResult.fields.map(
                                                    (field: ExtractedValue, fieldIndex: number) => (
                                                        <div
                                                            key={`field-${field.fieldName}-${fieldIndex}`}
                                                            className="border-l-4 border-l-blue-500 bg-muted/50 rounded p-3"
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-sm">
                                                                    {field.fieldName}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm font-medium">
                                                                {formatValue(field.value, "text")}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Tables */}
                                {extractionResult.tables.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Tables</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {extractionResult.tables.map(
                                                (table: ExtractedTable, tableIndex: number) => (
                                                    <div
                                                        key={`table-${table.tableName}-${tableIndex}`}
                                                        className="space-y-2"
                                                    >
                                                        <h4 className="font-medium">{table.tableName}</h4>
                                                        {table.rows.length > 0 ? (
                                                            <div className="overflow-x-auto">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            {Object.keys(table.rows[0].values).map(
                                                                                (
                                                                                    columnName: string,
                                                                                    colIndex: number,
                                                                                ) => (
                                                                                    <TableHead key={colIndex}>
                                                                                        {columnName}
                                                                                    </TableHead>
                                                                                ),
                                                                            )}
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {table.rows.map(
                                                                            (
                                                                                row: {
                                                                                    values: Record<
                                                                                        string,
                                                                                        | string
                                                                                        | number
                                                                                        | boolean
                                                                                        | Date
                                                                                        | null
                                                                                    >;
                                                                                },
                                                                                rowIndex: number,
                                                                            ) => (
                                                                                <TableRow
                                                                                    key={`row-${tableIndex}-${rowIndex}`}
                                                                                >
                                                                                    {Object.values(row.values).map(
                                                                                        (
                                                                                            value:
                                                                                                | string
                                                                                                | number
                                                                                                | boolean
                                                                                                | Date
                                                                                                | null,
                                                                                            colIndex: number,
                                                                                        ) => (
                                                                                            <TableCell
                                                                                                key={`col-${tableIndex}-${rowIndex}-${colIndex}`}
                                                                                            >
                                                                                                {formatValue(
                                                                                                    value,
                                                                                                    "text",
                                                                                                )}
                                                                                            </TableCell>
                                                                                        ),
                                                                                    )}
                                                                                </TableRow>
                                                                            ),
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                No table data found
                                                            </p>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center">
                                <div className="text-center">
                                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        {execution.status === "failed"
                                            ? "No data extracted due to processing error"
                                            : "No extraction results available"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
