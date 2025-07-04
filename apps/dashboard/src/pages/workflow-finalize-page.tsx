import type { CategoriesConfiguration } from "@paperjet/engine/types";
import { getOutdatedFieldCount, getOutdatedTableCount, isWorkflowOutdated } from "@paperjet/engine/utils/outdated-check";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, BookOpen, FileText, Plus, RefreshCw, Table } from "lucide-react";
import React, { useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import BasicWorkflowDataForm, { type BasicWorkflowDataFormRef } from "@/components/workflow/basic-workflow-data-form";
import ConfigureSectionsSheet from "@/components/workflow/configure-sections-sheet";
import EditFieldSheet from "@/components/workflow/edit-field-sheet";
import WorkflowCategories from "@/components/workflow/workflow-categories";
import { useReExtractData } from "@/hooks/use-re-extract-data";
import { useUpdateWorkflowBasicData } from "@/hooks/use-update-workflow-basic-data";
import { useWorkflow } from "@/hooks/useWorkflow";
import { getDocument } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function WorkflowFinalizePage() {
    const { workflowId } = useParams({
        from: "/_app/workflows/$workflowId/finalize",
    });

    const navigate = useNavigate();
    const { workflow } = useWorkflow(workflowId);
    const { mutate: updateWorkflow, isPending } = useUpdateWorkflowBasicData();
    const { mutate: reExtractData, isPending: isExtracting } = useReExtractData();
    const formRef = useRef<BasicWorkflowDataFormRef>(null);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [isConfigureSectionsOpen, setIsConfigureSectionsOpen] = useState(false);
    const [isAddFieldSheetOpen, setIsAddFieldSheetOpen] = useState(false);

    // Fetch document URL when workflow is loaded
    React.useEffect(() => {
        if (workflow?.fileId) {
            getDocument(workflow.fileId)
                .then((doc) => {
                    setDocumentUrl(doc.presignedUrl);
                })
                .catch((error) => {
                    console.error("Failed to load document:", error);
                });
        }
    }, [workflow?.fileId]);

    const handleSaveWorkflow = async () => {
        if (!formRef.current || !workflow) return;

        const formData = await formRef.current.submit();
        if (formData) {
            updateWorkflow(
                {
                    workflowId: workflow.id,
                    name: formData.name,
                    description: formData.description,
                },
                {
                    onSuccess: () => {
                        navigate({ to: "/" });
                    },
                },
            );
        }
    };

    const handleSaveCategories = (categories: CategoriesConfiguration) => {
        // TODO: Implement API call to save categories
        console.log("Saving categories:", categories);
    };

    const handleAddField = () => {
        setIsAddFieldSheetOpen(true);
    };

    const handleAddTable = () => {
        // TODO: Implement add table functionality
        console.log("Add table clicked");
    };

    const handleReExtract = () => {
        if (workflow) {
            reExtractData(workflow.id);
        }
    };

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Finalize Workflow</h1>
                    <p className="text-muted-foreground mt-2">Review, customize and save your workflow. You can test your configuration against the sample document.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/">
                            <ArrowLeft className="h-3 w-3 mr-1" />
                            Back to workflows
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <a href="https://docs.getpaperjet.com/" target="_blank" rel="noopener noreferrer">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Documentation
                        </a>
                    </Button>
                </div>
            </div>

            {/* Workflow Basic Info Form */}
            <div className="pt-8 border-t">{workflow && <BasicWorkflowDataForm ref={formRef} workflow={workflow} />}</div>

            {/* Split View */}
            {workflow && (
                <div className="pt-8 border-t">
                    <ResizablePanelGroup direction="horizontal" className="h-[850px]">
                        {/* Document Preview */}
                        <ResizablePanel defaultSize={50} minSize={30}>
                            <div className="h-full pr-3 space-y-6">
                                <h2 className="text-xl font-semibold">Document Preview</h2>
                                {documentUrl ? (
                                    <iframe src={documentUrl} className="w-full h-[800px] border rounded" title="Document Preview" />
                                ) : (
                                    <div className="flex items-center justify-center h-[800px] bg-muted rounded">
                                        <p className="text-muted-foreground">Loading document...</p>
                                    </div>
                                )}
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Data View */}
                        <ResizablePanel defaultSize={50} minSize={30}>
                            <div className="h-full pl-3 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Workflow Configuration</h2>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={handleAddField}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Add Field
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handleAddTable}>
                                                    <Table className="h-4 w-4 mr-2" />
                                                    Add Table
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="outline" size="sm" onClick={() => setIsConfigureSectionsOpen(true)}>
                                            Configure sections
                                        </Button>
                                    </div>
                                </div>
                                <div className="overflow-y-auto max-h-[800px]">
                                    <WorkflowCategories workflow={workflow} />
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            )}

            {/* Action Row */}
            {workflow && (
                <div className="flex items-center justify-between pt-8 border-t">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="lg">
                            Cancel
                        </Button>
                        {isWorkflowOutdated(workflow) && (
                            <p className="text-sm text-muted-foreground">
                                <AlertCircle className="inline h-3 w-3 mr-1" />
                                <strong>Note:</strong> {getOutdatedFieldCount(workflow)} field(s) and {getOutdatedTableCount(workflow)} table(s) have been modified. Run extraction again to see the
                                updated values.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant={isWorkflowOutdated(workflow) ? "default" : "outline"} size="lg" onClick={handleReExtract} disabled={isExtracting || workflow?.status === "extracting"}>
                            <RefreshCw className={cn("h-4 w-4 mr-2", (isExtracting || workflow?.status === "extracting") && "animate-spin")} />
                            {isExtracting || workflow?.status === "extracting" ? "Extracting..." : "Run extraction"}
                        </Button>
                        <Button size="lg" onClick={handleSaveWorkflow} disabled={isPending}>
                            {isPending ? "Saving..." : "Save Workflow"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Configure Sections Sheet */}
            {workflow && <ConfigureSectionsSheet categories={workflow.categories} isOpen={isConfigureSectionsOpen} onClose={() => setIsConfigureSectionsOpen(false)} onSave={handleSaveCategories} />}

            {/* Add Field Sheet */}
            {workflow && (
                <EditFieldSheet field={null} workflowId={workflow.id} isOpen={isAddFieldSheetOpen} onClose={() => setIsAddFieldSheetOpen(false)} mode="create" categories={workflow.categories} />
            )}
        </div>
    );
}
