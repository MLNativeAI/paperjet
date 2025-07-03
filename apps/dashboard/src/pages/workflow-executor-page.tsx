/** biome-ignore-all lint/suspicious/noArrayIndexKey: Too lazy */
import type { ExtractionResult } from "@paperjet/db/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { FileList } from "@/components/file-list";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { WorkflowExtractionResults } from "@/components/workflow-extraction-results";
import { WorkflowHeader } from "@/components/workflow-header";
import { WorkflowInfo } from "@/components/workflow-info";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";

interface UploadedFile {
    file: File;
    id: string;
    status: "pending" | "processing" | "completed" | "failed";
    result?: ExtractionResult;
    error?: string;
}

export default function WorkflowExecutorPage() {
    const { workflowId } = useParams({ from: "/_app/workflows/$workflowId/run" });
    const navigate = useNavigate();
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [executionId, setExecutionId] = useState<string | null>(null);
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

    const { workflow, isLoading: workflowLoading } = useWorkflow(workflowId);
    const { executeWorkflow, exportResults } = useWorkflowExecution(workflowId);

    const handleFileUpload = useCallback(
        (files: FileList) => {
            const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
                file,
                id: crypto.randomUUID(),
                status: "processing",
            }));

            setUploadedFiles((prev) => [...prev, ...newFiles]);

            // Start processing immediately
            const filesToProcess = Array.from(files);
            executeWorkflow.mutate(filesToProcess, {
                onSuccess: (data) => {
                    // Handle multiple executions response
                    const executions = data.executions || [];

                    // Update uploaded files with results from individual executions
                    setUploadedFiles((prev) =>
                        prev.map((f) => {
                            const execution = executions.find((ex: { filename: string }) => ex.filename === f.file.name);
                            if (execution) {
                                return {
                                    ...f,
                                    status: execution.status as "completed" | "failed",
                                    result: execution.extractionResult,
                                    error: execution.error,
                                };
                            }
                            return {
                                ...f,
                                status: "failed" as const,
                                error: "No execution found for this file",
                            };
                        }),
                    );

                    // Store first execution ID for reference
                    if (executions.length > 0) {
                        setExecutionId(executions[0].executionId);
                    }
                },
                onError: () => {
                    // Mark all new files as failed if the execution fails
                    setUploadedFiles((prev) =>
                        prev.map((f) => {
                            if (filesToProcess.some((file) => file.name === f.file.name)) {
                                return {
                                    ...f,
                                    status: "failed" as const,
                                    error: "Processing failed",
                                };
                            }
                            return f;
                        }),
                    );
                },
            });
        },
        [executeWorkflow],
    );

    const removeFile = useCallback((fileId: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    }, []);

    // Removed startExecution - processing now happens automatically on upload

    const toggleResultExpansion = useCallback((fileId: string) => {
        setExpandedResults((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    }, []);

    const renderExtractionResults = useCallback((result: ExtractionResult, _fileId: string) => {
        return <WorkflowExtractionResults result={result} />;
    }, []);

    const handleExportResults = useCallback(() => {
        exportResults(uploadedFiles, executionId);
    }, [uploadedFiles, executionId, exportResults]);

    if (workflowLoading) {
        return (
            <div className="w-full px-4 py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading workflow...</span>
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

    const config = workflow.configuration;
    const completedFiles = uploadedFiles.filter((f) => f.status === "completed").length;
    const failedFiles = uploadedFiles.filter((f) => f.status === "failed").length;
    const processingFiles = uploadedFiles.filter((f) => f.status === "processing").length;
    const allCompleted = uploadedFiles.length > 0 && processingFiles === 0;

    return (
        <div className="w-full px-4 py-8 space-y-8">
            <WorkflowHeader
                workflowName={workflow.name}
                showActions={allCompleted && completedFiles > 0}
                onBack={() => navigate({ to: "/" })}
                onExportResults={handleExportResults}
                onViewHistory={() => navigate({ to: `/workflows/${workflowId}/history` })}
            />

            <WorkflowInfo configuration={config} />

            <FileUpload onFileUpload={handleFileUpload} />

            <FileList
                files={uploadedFiles}
                expandedResults={expandedResults}
                processingFiles={processingFiles}
                completedFiles={completedFiles}
                failedFiles={failedFiles}
                allCompleted={allCompleted}
                isExecuting={executeWorkflow.isPending}
                onRemoveFile={removeFile}
                onStartExecution={undefined}
                onToggleResultExpansion={toggleResultExpansion}
                renderExtractionResults={renderExtractionResults}
            />
        </div>
    );
}
