import { useNavigate } from "@tanstack/react-router";
import {
    ArrowLeft,
    CheckCircle,
    DollarSign,
    FileSpreadsheet,
    FileText,
    Loader2,
    Package,
    Receipt,
    ScrollText,
    Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/document-preview";
import { ExtractedValues } from "@/components/extracted-values";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkflow } from "@/hooks/useWorkflow";

const workflowTemplates = [
    {
        id: "invoice",
        name: "Invoice Processing",
        description: "Extract vendor, amounts, line items, and payment details from invoices",
        icon: FileText,
        color: "text-blue-600",
    },
    {
        id: "receipt",
        name: "Receipt Scanning",
        description: "Capture merchant, date, total, and itemized purchases from receipts",
        icon: Receipt,
        color: "text-green-600",
    },
    {
        id: "purchase-order",
        name: "Purchase Orders",
        description: "Extract PO numbers, items, quantities, and delivery information",
        icon: Package,
        color: "text-purple-600",
    },
    {
        id: "bank-statement",
        name: "Bank Statements",
        description: "Process transactions, balances, and account details from statements",
        icon: DollarSign,
        color: "text-orange-600",
    },
    {
        id: "contract",
        name: "Contracts & Agreements",
        description: "Extract parties, terms, dates, and key clauses from legal documents",
        icon: ScrollText,
        color: "text-red-600",
    },
    {
        id: "tax-form",
        name: "Tax Forms",
        description: "Process W-2s, 1099s, and other tax documents for key data points",
        icon: FileSpreadsheet,
        color: "text-indigo-600",
    },
];

export default function WorkflowCreatorPage() {
    const navigate = useNavigate();
    const [_file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [workflowId, setWorkflowId] = useState<string>("");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [phase, setPhase] = useState<"template" | "upload" | "analyzing" | "extracting" | "complete">("template");

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

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        setPhase("upload");
    };

    const handleCustomWorkflow = () => {
        setSelectedTemplate(null);
        setPhase("upload");
    };

    const renderTemplateSelectionPhase = () => (
        <div className="w-full px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Create New Workflow</h1>
                <p className="text-muted-foreground">
                    Choose a template to get started or create a custom workflow from scratch
                </p>
            </div>

            <div className="space-y-8">
                {/* Custom Workflow Option */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Create a custom workflow</h2>
                    <p className="text-muted-foreground mb-6">
                        Upload any document and we'll analyze it to suggest extraction fields
                    </p>

                    <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 border-dashed"
                        onClick={handleCustomWorkflow}
                    >
                        <CardContent className="p-8 text-center">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">Custom Workflow</h3>
                            <p className="text-muted-foreground">Start from scratch with your own document</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Template Selection */}
                <div className="border-t pt-8">
                    <h2 className="text-xl font-semibold mb-4">Or choose from a template</h2>
                    <p className="text-muted-foreground mb-6">
                        Start with a pre-built workflow for common document types
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workflowTemplates.map((template) => {
                            const Icon = template.icon;
                            return (
                                <Card
                                    key={template.id}
                                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                                    onClick={() => handleTemplateSelect(template.id)}
                                >
                                    <CardHeader>
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg bg-gray-50 ${template.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {template.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Workflows
                </Button>
            </div>
        </div>
    );

    const renderUploadPhase = () => {
        const selectedTemplateData = selectedTemplate ? workflowTemplates.find((t) => t.id === selectedTemplate) : null;

        return (
            <div className="w-full px-4 py-8">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => setPhase("template")} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Templates
                    </Button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">
                            {selectedTemplateData
                                ? `Create ${selectedTemplateData.name} Workflow`
                                : "Create Custom Workflow"}
                        </h1>
                        <p className="text-muted-foreground">
                            {selectedTemplateData
                                ? `Upload a ${selectedTemplateData.name.toLowerCase()} document to get started.`
                                : "Upload a document to get started. We'll analyze it and suggest fields to extract."}
                        </p>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Card className="w-full max-w-2xl">
                        <CardContent className="p-0">
                            {/** biome-ignore lint/a11y/noStaticElementInteractions: drag and drop functionality requires these interactions */}
                            <div
                                className={`rounded-lg py-12 text-center transition-colors ${
                                    isDragging ? "border-primary bg-primary/5" : "border-gray-300"
                                }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">
                                    Drop your document here or click to browse
                                </h3>
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
            </div>
        );
    };

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
            {phase === "template" && renderTemplateSelectionPhase()}
            {phase === "upload" && renderUploadPhase()}
            {(phase === "analyzing" || phase === "extracting") && renderLoadingPhase()}
            {phase === "complete" && renderResultsPhase()}
        </>
    );
}
