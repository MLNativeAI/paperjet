import type { CategoriesConfiguration } from "@paperjet/engine/types";
import { useParams } from "@tanstack/react-router";
import { FileText, Plus, Table } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BasicWorkflowDataForm, { type BasicWorkflowDataFormRef } from "@/components/workflow/basic-workflow-data-form";
import ConfigureSectionsSheet from "@/components/workflow/configure-sections-sheet";
import WorkflowCategories from "@/components/workflow/workflow-categories";
import { useUpdateWorkflowBasicData } from "@/hooks/use-update-workflow-basic-data";
import { useWorkflow } from "@/hooks/useWorkflow";
import { getDocument } from "@/lib/api";

export default function WorkflowFinalizePage() {
    const { workflowId } = useParams({
        from: "/_app/workflows/$workflowId/finalize",
    });

    const { workflow } = useWorkflow(workflowId);
    const { mutate: updateWorkflow, isPending } = useUpdateWorkflowBasicData();
    const formRef = useRef<BasicWorkflowDataFormRef>(null);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [isConfigureSectionsOpen, setIsConfigureSectionsOpen] = useState(false);

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
            updateWorkflow({
                workflowId: workflow.id,
                name: formData.name,
                description: formData.description,
            });
        }
    };

    const handleSaveCategories = (categories: CategoriesConfiguration) => {
        // TODO: Implement API call to save categories
        console.log("Saving categories:", categories);
    };

    const handleAddField = () => {
        // TODO: Implement add field functionality
        console.log("Add field clicked");
    };

    const handleAddTable = () => {
        // TODO: Implement add table functionality
        console.log("Add table clicked");
    };

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Finalize Workflow</h1>
                    <p className="text-muted-foreground mt-2">Review, customize and save your workflow</p>
                </div>
            </div>

            {/* Workflow Basic Info Form */}
            <div className="pt-8 border-t">{workflow && <BasicWorkflowDataForm ref={formRef} workflow={workflow} />}</div>

            {/* Split View */}
            {workflow && (
                <div className="pt-8 border-t">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Document Preview */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Document Preview</h2>
                            {documentUrl ? (
                                <iframe src={documentUrl} className="w-full h-[800px] border rounded" title="Document Preview" />
                            ) : (
                                <div className="flex items-center justify-center h-[800px] bg-muted rounded">
                                    <p className="text-muted-foreground">Loading document...</p>
                                </div>
                            )}
                        </div>

                        {/* Data View */}
                        <div className="space-y-6">
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
                    </div>
                </div>
            )}

            {/* Action Row */}
            {workflow && (
                <div className="flex items-center justify-end pt-8 border-t">
                    <Button size="lg" onClick={handleSaveWorkflow} disabled={isPending}>
                        {isPending ? "Saving..." : "Save Workflow"}
                    </Button>
                </div>
            )}

            {/* Configure Sections Sheet */}
            {workflow && <ConfigureSectionsSheet categories={workflow.categories} isOpen={isConfigureSectionsOpen} onClose={() => setIsConfigureSectionsOpen(false)} onSave={handleSaveCategories} />}
        </div>
    );
}
