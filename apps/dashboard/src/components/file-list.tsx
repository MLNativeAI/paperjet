import type { ExtractionResult } from "@paperjet/db/types";
import { CheckCircle, ChevronDown, ChevronRight, Clock, Play, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UploadedFile {
    file: File;
    id: string;
    status: "pending" | "processing" | "completed" | "failed";
    result?: ExtractionResult;
    error?: string;
}

interface FileListProps {
    files: UploadedFile[];
    expandedResults: Set<string>;
    processingFiles: number;
    completedFiles: number;
    failedFiles: number;
    allCompleted: boolean;
    isExecuting: boolean;
    onRemoveFile: (fileId: string) => void;
    onStartExecution: () => void;
    onToggleResultExpansion: (fileId: string) => void;
    renderExtractionResults: (result: ExtractionResult, fileId: string) => React.ReactNode;
}

const getStatusIcon = (status: UploadedFile["status"]) => {
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

const getStatusColor = (status: UploadedFile["status"]) => {
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

export function FileList({
    files,
    expandedResults,
    processingFiles,
    completedFiles,
    failedFiles,
    allCompleted,
    isExecuting,
    onRemoveFile,
    onStartExecution,
    onToggleResultExpansion,
    renderExtractionResults,
}: FileListProps) {
    if (files.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Uploaded Files ({files.length})</span>
                    {processingFiles === 0 && (
                        <Button onClick={onStartExecution} disabled={isExecuting || files.length === 0}>
                            <Play className="h-4 w-4 mr-2" />
                            Execute Workflow
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {files.map((uploadedFile) => (
                        <div key={uploadedFile.id} className="border rounded-lg">
                            <div className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(uploadedFile.status)}
                                    <div>
                                        <p className="font-medium">{uploadedFile.file.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant={getStatusColor(uploadedFile.status)}>{uploadedFile.status}</Badge>

                                    {uploadedFile.status === "completed" && uploadedFile.result && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleResultExpansion(uploadedFile.id)}
                                        >
                                            {expandedResults.has(uploadedFile.id) ? (
                                                <>
                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                    Hide Results
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronRight className="h-4 w-4 mr-1" />
                                                    View Results
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {uploadedFile.status === "pending" && (
                                        <Button variant="ghost" size="sm" onClick={() => onRemoveFile(uploadedFile.id)}>
                                            Remove
                                        </Button>
                                    )}

                                    {uploadedFile.status === "failed" && uploadedFile.error && (
                                        <div className="text-sm text-red-600 max-w-xs truncate">
                                            {uploadedFile.error}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {uploadedFile.status === "completed" &&
                                uploadedFile.result &&
                                expandedResults.has(uploadedFile.id) && (
                                    <div className="border-t p-4 bg-muted/20">
                                        {renderExtractionResults(uploadedFile.result, uploadedFile.id)}
                                    </div>
                                )}
                        </div>
                    ))}
                </div>

                {processingFiles > 0 && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Processing Progress</span>
                            <span className="text-sm text-muted-foreground">
                                {completedFiles + failedFiles} of {files.length} completed
                            </span>
                        </div>
                        <Progress value={((completedFiles + failedFiles) / files.length) * 100} className="w-full" />
                    </div>
                )}

                {allCompleted && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Execution Summary</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-green-600 font-medium">{completedFiles}</span>
                                <span className="text-muted-foreground"> successful</span>
                            </div>
                            <div>
                                <span className="text-red-600 font-medium">{failedFiles}</span>
                                <span className="text-muted-foreground"> failed</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground font-medium">{files.length}</span>
                                <span className="text-muted-foreground"> total</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
