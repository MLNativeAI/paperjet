import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, DollarSign, FileSpreadsheet, FileText, Loader2, Package, Receipt, ScrollText, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { FileUploadArea } from "@/components/file-upload-area";
import { LoadingIndicator } from "@/components/loading-indicator";
import { ProgressSteps } from "@/components/progress-steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    const [workflowId, setWorkflowId] = useState<string>("");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [phase, setPhase] = useState<"template" | "upload" | "loading">("template");

    const { createWorkflowFromFile, analyzeWorkflow, workflow } = useWorkflow(workflowId);

    const handleFileSelect = (selectedFile: File) => {
        setPhase("loading");
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

    // Watch for workflow status changes and navigate accordingly
    useEffect(() => {
        if (workflow && workflowId) {
            const status = workflow.status;
            
            // Navigate to finalize page when status changes to extracting or configuring
            if (status === "extracting" || status === "configuring") {
                navigate({ to: `/workflows/${workflowId}/finalize` });
            }
        }
    }, [workflow, workflowId, navigate]);

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
        return (
            <div className="w-full px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">Creating Workflow</h1>
                    <p className="text-muted-foreground">Setting up your workflow...</p>
                </div>

                <div className="flex justify-center">
                    <Card className="w-full max-w-2xl">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center space-y-6">
                                <div className="relative">
                                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-medium">Preparing your workflow</p>
                                    <p className="text-sm text-muted-foreground">Please wait a moment...</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // Results phase has been moved to the finalize page

    return (
        <>
            {phase === "template" && renderTemplateSelectionPhase()}
            {phase === "upload" && renderUploadPhase()}
            {phase === "loading" && renderLoadingPhase()}
        </>
    );
}
