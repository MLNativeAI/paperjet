import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, Copy, Download, FileText, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

interface ExtractedValue {
    fieldName: string;
    value: any;
    confidence: number;
}

interface ExtractedTable {
    tableName: string;
    rows: Array<{ values: Record<string, any> }>;
    confidence: number;
}

interface ExtractionResult {
    fields: ExtractedValue[];
    tables: ExtractedTable[];
}

interface ExecutionFile {
    id: string;
    fileId: string;
    extractionResult: string | null;
    status: ExecutionStatus;
    errorMessage: string | null;
    createdAt: string;
    filename: string;
}

interface ExecutionDetail {
    id: string;
    workflowId: string;
    status: ExecutionStatus;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    files: ExecutionFile[];
    workflow: {
        id: string;
        name: string;
        documentType: string;
        configuration: string;
    };
}

export default function ExecutionDetailPage() {
    const { executionId } = useParams({ from: "/_app/executions/$executionId" });
    const navigate = useNavigate();
    const [selectedFileIndex, setSelectedFileIndex] = useState(0);

    // For now, we'll fetch this data by getting the execution from the workflow executions
    // In a real implementation, you'd want a dedicated endpoint for execution details
    const { data: execution, isLoading } = useQuery({
        queryKey: ["execution", executionId],
        queryFn: async () => {
            // This is a workaround - in practice you'd want GET /api/executions/:id
            // For now we'll need to find the execution through workflow history
            throw new Error("Execution detail endpoint not implemented yet");
        },
        enabled: false, // Disable for now since we don't have the endpoint
    });

    // Mock data for demonstration - replace with real API call
    const mockExecution: ExecutionDetail = {
        id: executionId,
        workflowId: "workflow-1",
        status: "completed",
        startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        completedAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        createdAt: new Date(Date.now() - 300000).toISOString(),
        workflow: {
            id: "workflow-1",
            name: "Invoice Processing",
            documentType: "Invoice",
            configuration: JSON.stringify({
                fields: [
                    {
                        name: "invoice_number",
                        description: "Invoice number",
                        type: "text",
                    },
                    {
                        name: "total_amount",
                        description: "Total amount",
                        type: "currency",
                    },
                    { name: "invoice_date", description: "Invoice date", type: "date" },
                ],
                tables: [],
            }),
        },
        files: [
            {
                id: "file-1",
                fileId: "uploaded-file-1",
                status: "completed",
                errorMessage: null,
                createdAt: new Date().toISOString(),
                filename: "invoice-001.pdf",
                extractionResult: JSON.stringify({
                    fields: [
                        {
                            fieldName: "invoice_number",
                            value: "INV-2024-001",
                            confidence: 0.95,
                        },
                        { fieldName: "total_amount", value: 1250.0, confidence: 0.92 },
                        {
                            fieldName: "invoice_date",
                            value: "2024-01-15",
                            confidence: 0.88,
                        },
                    ],
                    tables: [],
                }),
            },
            {
                id: "file-2",
                fileId: "uploaded-file-2",
                status: "failed",
                errorMessage: "Unable to process file: corrupted PDF",
                createdAt: new Date().toISOString(),
                filename: "invoice-002.pdf",
                extractionResult: null,
            },
        ],
    };

    const selectedFile = mockExecution.files[selectedFileIndex];
    const config = JSON.parse(mockExecution.workflow.configuration);

    let extractionResult: ExtractionResult | null = null;
    if (selectedFile.extractionResult) {
        try {
            extractionResult = JSON.parse(selectedFile.extractionResult);
        } catch (e) {
            console.error("Failed to parse extraction result:", e);
        }
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

    const formatValue = (value: any, type: string) => {
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
        const results = mockExecution.files
            .filter((f) => f.status === "completed" && f.extractionResult)
            .map((f) => ({
                filename: f.filename,
                extractionResult: JSON.parse(f.extractionResult!),
            }));

        const dataStr = JSON.stringify(
            {
                executionId: mockExecution.id,
                workflowId: mockExecution.workflowId,
                workflowName: mockExecution.workflow.name,
                executedAt: mockExecution.startedAt,
                results,
            },
            null,
            2,
        );

        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `execution-${mockExecution.id}.json`;
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

    const successfulFiles = mockExecution.files.filter((f) => f.status === "completed").length;
    const failedFiles = mockExecution.files.filter((f) => f.status === "failed").length;

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate({ to: `/workflows/${mockExecution.workflowId}/history` })}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to History
                    </Button>
                    <h1 className="text-3xl font-bold">Execution Details</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-muted-foreground">{mockExecution.workflow.name}</span>
                        <Badge variant="secondary">{mockExecution.workflow.documentType}</Badge>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(mockExecution.status)}
                            <Badge variant={getStatusColor(mockExecution.status)}>{mockExecution.status}</Badge>
                        </div>
                    </div>
                </div>

                {successfulFiles > 0 && (
                    <Button onClick={exportResults}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                    </Button>
                )}
            </div>

            {/* Execution Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-2xl font-bold">{mockExecution.files.length}</p>
                                <p className="text-xs text-muted-foreground">Files Processed</p>
                            </div>
                            <FileText className="h-4 w-4 text-muted-foreground ml-auto" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-2xl font-bold text-green-600">{successfulFiles}</p>
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
                                <p className="text-2xl font-bold text-red-600">{failedFiles}</p>
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
                                <p className="text-2xl font-bold">
                                    {formatDuration(mockExecution.startedAt, mockExecution.completedAt)}
                                </p>
                                <p className="text-xs text-muted-foreground">Duration</p>
                            </div>
                            <Clock className="h-4 w-4 text-muted-foreground ml-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                                    <code className="text-sm bg-muted px-2 py-1 rounded">{mockExecution.id}</code>
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(mockExecution.id)}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Started At</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(mockExecution.startedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Workflow</p>
                                <p>{mockExecution.workflow.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {mockExecution.completedAt
                                            ? new Date(mockExecution.completedAt).toLocaleString()
                                            : "In progress"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* File Results */}
            <Card>
                <CardHeader>
                    <CardTitle>Processing Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={selectedFileIndex.toString()}
                        onValueChange={(value) => setSelectedFileIndex(parseInt(value))}
                    >
                        <TabsList className="grid w-full grid-cols-auto">
                            {mockExecution.files.map((file, index) => (
                                <TabsTrigger key={file.id} value={index.toString()} className="flex items-center gap-2">
                                    {getStatusIcon(file.status)}
                                    <span className="truncate max-w-32">{file.filename}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {mockExecution.files.map((file, index) => (
                            <TabsContent key={file.id} value={index.toString()} className="mt-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Document Preview */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Document Preview</h3>
                                        {file.status === "failed" ? (
                                            <Card className="h-96 flex items-center justify-center">
                                                <div className="text-center">
                                                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                                                    <h4 className="font-semibold mb-2">Processing Failed</h4>
                                                    <p className="text-sm text-muted-foreground max-w-sm">
                                                        {file.errorMessage ||
                                                            "An error occurred while processing this file"}
                                                    </p>
                                                </div>
                                            </Card>
                                        ) : (
                                            <DocumentPreview fileId={file.fileId} />
                                        )}
                                    </div>

                                    {/* Extraction Results */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Extracted Data</h3>
                                        {file.status === "completed" && extractionResult ? (
                                            <div className="space-y-4">
                                                {/* Fields */}
                                                {extractionResult.fields.length > 0 && (
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="text-base">Fields</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                {extractionResult.fields.map((field, fieldIndex) => {
                                                                    const fieldConfig = config.fields.find(
                                                                        (f: any) => f.name === field.fieldName,
                                                                    );
                                                                    return (
                                                                        <div
                                                                            key={fieldIndex}
                                                                            className="border-l-4 border-l-blue-500 bg-muted/50 rounded p-3"
                                                                        >
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="font-medium text-sm">
                                                                                    {field.fieldName}
                                                                                </span>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs"
                                                                                >
                                                                                    {fieldConfig?.type || "text"}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="text-sm font-medium">
                                                                                {formatValue(
                                                                                    field.value,
                                                                                    fieldConfig?.type || "text",
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
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
                                                            {extractionResult.tables.map((table, tableIndex) => {
                                                                const tableConfig = config.tables.find(
                                                                    (t: any) => t.name === table.tableName,
                                                                );
                                                                return (
                                                                    <div key={tableIndex} className="space-y-2">
                                                                        <h4 className="font-medium">
                                                                            {table.tableName}
                                                                        </h4>
                                                                        {table.rows.length > 0 ? (
                                                                            <div className="overflow-x-auto">
                                                                                <Table>
                                                                                    <TableHeader>
                                                                                        <TableRow>
                                                                                            {tableConfig?.columns.map(
                                                                                                (
                                                                                                    column: any,
                                                                                                    colIndex: number,
                                                                                                ) => (
                                                                                                    <TableHead
                                                                                                        key={colIndex}
                                                                                                    >
                                                                                                        {column.name}
                                                                                                    </TableHead>
                                                                                                ),
                                                                                            )}
                                                                                        </TableRow>
                                                                                    </TableHeader>
                                                                                    <TableBody>
                                                                                        {table.rows.map(
                                                                                            (row, rowIndex) => (
                                                                                                <TableRow
                                                                                                    key={rowIndex}
                                                                                                >
                                                                                                    {tableConfig?.columns.map(
                                                                                                        (
                                                                                                            column: any,
                                                                                                            colIndex: number,
                                                                                                        ) => (
                                                                                                            <TableCell
                                                                                                                key={
                                                                                                                    colIndex
                                                                                                                }
                                                                                                            >
                                                                                                                {formatValue(
                                                                                                                    row
                                                                                                                        .values[
                                                                                                                        column
                                                                                                                            .name
                                                                                                                    ],
                                                                                                                    column.type,
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
                                                                );
                                                            })}
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        ) : (
                                            <Card className="h-48 flex items-center justify-center">
                                                <div className="text-center">
                                                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        {file.status === "failed"
                                                            ? "No data extracted due to processing error"
                                                            : "No extraction results available"}
                                                    </p>
                                                </div>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
