import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, DollarSign, FileSpreadsheet, FileText, Loader2, Package, Receipt, ScrollText, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { DocumentPreview } from "@/components/document-preview";
import { ExtractedValues } from "@/components/extracted-values";
import { FileUploadArea } from "@/components/file-upload-area";
import { LoadingIndicator } from "@/components/loading-indicator";
import { ProgressSteps } from "@/components/progress-steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowTemplateCard } from "@/components/workflow-template-card";
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
    const [workflowId, setWorkflowId] = useState<string>("");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [phase, setPhase] = useState<"template" | "upload" | "analyzing" | "extracting" | "complete">("template");

    const { createWorkflowFromFile, analyzeWorkflow, extractData, workflow, isAnalysisComplete, analysisStatus } = useWorkflow(workflowId);

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
                <p className="text-muted-foreground">Choose a template to get started or create a custom workflow from scratch</p>
            </div>

            <div className="space-y-8">
                {/* Custom Workflow Option */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Create a custom workflow</h2>
                    <p className="text-muted-foreground mb-6">Upload any document and we'll analyze it to suggest extraction fields</p>

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
                    <p className="text-muted-foreground mb-6">Start with a pre-built workflow for common document types</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workflowTemplates.map((template) => (
                            <WorkflowTemplateCard key={template.id} template={template} onClick={handleTemplateSelect} />
                        ))}
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
                            {selectedTemplateData ? `Create ${selectedTemplateData.name} Workflow` : "Create Custom Workflow"}
                        </h1>
                        <p className="text-muted-foreground">
                            {selectedTemplateData
                                ? `Upload a ${selectedTemplateData.name.toLowerCase()} document to get started.`
                                : "Upload a document to get started. We'll analyze it and suggest fields to extract."}
                        </p>
                    </div>
                </div>

                <div className="flex justify-center">
                    <FileUploadArea onFileSelect={handleFileSelect} />
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
                    <h1 className="text-3xl font-bold mb-4">{isAnalyzing ? "Analyzing Document" : "Extracting Data"}</h1>
                    <p className="text-muted-foreground">
                        {isAnalyzing ? "We're analyzing your document to suggest fields for extraction..." : "Extracting data based on the analysis..."}
                    </p>
                </div>

                <div className="flex justify-center">
                    <Card className="w-full max-w-2xl">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <ProgressSteps currentStep={phase} />
                                <LoadingIndicator phase={phase} />
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
                    <p className="text-muted-foreground">Review the extracted data and configure field settings as needed.</p>
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
                            <Button onClick={() => navigate({ to: `/workflows/${workflowId}/configure` })} className="w-full">
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
