import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, FileText, Loader2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/document-preview";
import { ExtractedValues } from "@/components/extracted-values";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkflow } from "@/hooks/useWorkflow";

export default function WorkflowCreatorPage() {
    const navigate = useNavigate();
    const [_file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [workflowId, setWorkflowId] = useState<string>("");
    const [phase, setPhase] = useState<"upload" | "analyzing" | "extracting" | "complete">("upload");

    const { createWorkflowFromFile, analyzeWorkflow, extractData, workflow, isAnalysisComplete, analysisStatus } =
        useWorkflow(workflowId);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setPhase("analyzing");
        createWorkflowFromFile.mutate(selectedFile, {
            onSuccess: (data) => {
                setWorkflowId(data.workflowId);
                // Trigger analysis immediately after workflow creation
                analyzeWorkflow.mutate(data.workflowId);
            },
            onError: () => {
                setPhase("upload");
            },
        });
    };

    // Watch for analysis completion and trigger extraction
    useEffect(() => {
        if (isAnalysisComplete && phase === "analyzing" && workflow) {
            setPhase("extracting");
            // Trigger extraction with the analyzed fields
            const firstFileId = workflow.fileId;
            if (firstFileId && analysisStatus?.suggestedFields) {
                extractData.mutate(
                    {
                        fileId: firstFileId,
                        fields: analysisStatus.suggestedFields,
                        tables: analysisStatus.suggestedTables || [],
                    },
                    {
                        onSuccess: () => {
                            setPhase("complete");
                        },
                    },
                );
            }
        }
    }, [isAnalysisComplete, phase, workflow, analysisStatus, extractData]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/"))) {
            handleFileSelect(droppedFile);
        } else {
            toast.error("Please upload a PDF or image file");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const renderUploadPhase = () => (
        <div className="w-full px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Create New Workflow</h1>
                <p className="text-muted-foreground">
                    Upload a document to get started. We'll analyze it and suggest fields to extract.
                </p>
            </div>

            <div className="flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardContent className="p-0">
                        {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
                        <div
                            className={`rounded-lg py-12 text-center transition-colors ${
                                isDragging ? "border-primary bg-primary/5" : "border-gray-300"
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">Drop your document here or click to browse</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Supports PDF and image files (PNG, JPG, etc.)
                            </p>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileInput}
                                className="hidden"
                                id="file-input"
                            />
                            <Button asChild>
                                <label htmlFor="file-input" className="cursor-pointer">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Select File
                                </label>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 text-center">
                <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
                    Back to Workflows
                </Button>
            </div>
        </div>
    );

    const renderLoadingPhase = () => {
        const isAnalyzing = phase === "analyzing";
        const isExtracting = phase === "extracting";

        return (
            <div className="w-full px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        {isAnalyzing ? "Analyzing Document" : "Extracting Data"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isAnalyzing
                            ? "We're analyzing your document to suggest fields for extraction..."
                            : "Extracting data based on the analysis..."}
                    </p>
                </div>

                <div className="flex justify-center">
                    <Card className="w-full max-w-2xl">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Progress Steps */}
                                <div className="flex items-center justify-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-sm font-medium">Upload Complete</span>
                                    </div>
                                    <div className="h-px bg-gray-200 w-8" />
                                    <div className="flex items-center space-x-2">
                                        {isAnalyzing ? (
                                            <div className="relative">
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                                <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse" />
                                            </div>
                                        ) : (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                        <span className={`text-sm font-medium ${isAnalyzing ? "text-blue-600" : ""}`}>
                                            {isAnalyzing ? "Analyzing..." : "Analysis"}
                                        </span>
                                    </div>
                                    <div className="h-px bg-gray-200 w-8" />
                                    <div className="flex items-center space-x-2">
                                        {isExtracting ? (
                                            <div className="relative">
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                                <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse" />
                                            </div>
                                        ) : isAnalyzing ? (
                                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                        ) : (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                        <span className={`text-sm font-medium ${isExtracting ? "text-blue-600" : ""}`}>
                                            {isExtracting ? "Extracting..." : "Extraction"}
                                        </span>
                                    </div>
                                </div>

                                {/* Current Status */}
                                <div className="text-center">
                                    <div className="relative mb-4">
                                        <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-500" />
                                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
                                        <div className="absolute inset-2 rounded-full border-2 border-blue-200 animate-ping" />
                                    </div>
                                    <p className="text-lg font-medium text-blue-700">
                                        {isAnalyzing ? "Analyzing document structure..." : "Extracting data..."}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {isAnalyzing
                                            ? "AI is identifying fields and structure in your document"
                                            : "Processing extracted data with the identified fields"}
                                    </p>
                                    <div className="mt-4 flex justify-center">
                                        <div className="flex space-x-1">
                                            <div
                                                className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                                                style={{ animationDelay: "0ms" }}
                                            />
                                            <div
                                                className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                                                style={{ animationDelay: "150ms" }}
                                            />
                                            <div
                                                className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                                                style={{ animationDelay: "300ms" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    const renderResultsPhase = () => {
        const firstFileId = workflow?.fileId;

        return (
            <div className="w-full px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">Workflow Results</h1>
                    <p className="text-muted-foreground">
                        Review the extracted data and configure field settings as needed.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Document Viewer */}
                    <div className="order-2 lg:order-1">
                        {firstFileId ? (
                            <DocumentPreview fileId={firstFileId} />
                        ) : (
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Document Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center h-96">
                                    <div className="text-center">
                                        <div className="relative mb-4">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                            <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">Loading document...</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Panel - Extracted Values (Primary) */}
                    <div className="order-1 lg:order-2">
                        <ExtractedValues
                            extractionResult={extractData.data?.extractionResult}
                            fields={analysisStatus?.suggestedFields || []}
                            tables={analysisStatus?.suggestedTables || []}
                            isLoading={extractData.isPending}
                            onExtractData={() => {
                                const firstFileId = workflow?.fileId;
                                if (firstFileId && analysisStatus?.suggestedFields) {
                                    extractData.mutate({
                                        fileId: firstFileId,
                                        fields: analysisStatus.suggestedFields,
                                        tables: analysisStatus.suggestedTables || [],
                                    });
                                }
                            }}
                        />

                        <div className="mt-6 space-y-4">
                            <Button
                                onClick={() => navigate({ to: `/workflows/${workflowId}/configure` })}
                                className="w-full"
                            >
                                Configure Fields & Save Workflow
                            </Button>
                            <Button variant="outline" onClick={() => navigate({ to: "/" })} className="w-full">
                                Back to Workflows
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {phase === "upload" && renderUploadPhase()}
            {(phase === "analyzing" || phase === "extracting") && renderLoadingPhase()}
            {phase === "complete" && renderResultsPhase()}
        </>
    );
}
