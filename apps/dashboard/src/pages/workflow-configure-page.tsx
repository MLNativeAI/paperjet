import type { ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DocumentPreview } from "@/components/document-preview";
import { ExtractedValues } from "@/components/extracted-values";
import { FieldCategoryGrid } from "@/components/field-category-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ViewToggle } from "@/components/view-toggle";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useWorkflowAnalysis } from "@/hooks/useWorkflowAnalysis";

type ViewMode = "grid" | "split";

export default function WorkflowConfigurePage() {
    const navigate = useNavigate();
    const { workflowId } = useParams({
        from: "/_app/workflows/$workflowId/configure",
    });
    const [workflowName, setWorkflowName] = useState("");
    const [fields, setFields] = useState<ExtractionField[]>([]);
    const [tables, setTables] = useState<ExtractionTable[]>([]);
    const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
    const [fileId, setFileId] = useState<string>("");
    const [analysisStatus, setAnalysisStatus] = useState<"pending" | "processing" | "completed">("pending");
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem("workflow-configure-view-mode");
        return (saved as ViewMode) || "grid";
    });

    const { workflow, isLoading, updateWorkflow, extractData } = useWorkflow(workflowId);

    // Only fetch analysis if workflow doesn't have fields configured yet
    const shouldFetchAnalysis =
        workflow && (!workflow.configuration?.fields || workflow.configuration.fields.length === 0);
    const { analysisData } = useWorkflowAnalysis(shouldFetchAnalysis ? workflowId : "");

    // Initialize state when workflow data loads
    useEffect(() => {
        if (workflow) {
            setWorkflowName(workflow.name || "");
            setFields(workflow.configuration?.fields || []);
            setTables(workflow.configuration?.tables || []);
            setFileId(workflow.fileId || "");

            // Set analysis status based on whether fields are already configured
            if (workflow.configuration?.fields && workflow.configuration.fields.length > 0) {
                setAnalysisStatus("completed");
            } else {
                setAnalysisStatus("pending");
            }
        }
    }, [workflow]);

    // Update state when analysis completes (only for new workflows without fields)
    useEffect(() => {
        if (analysisData && shouldFetchAnalysis) {
            if (analysisData.analysisComplete && analysisStatus !== "completed") {
                setAnalysisStatus("completed");

                // Update workflow name in state
                setWorkflowName(`${analysisData.documentType} Workflow`);

                // Update fields and tables from analysis if they're not already set
                if (analysisData.suggestedFields && fields.length === 0) {
                    setFields(analysisData.suggestedFields);
                }
                if (analysisData.suggestedTables && tables.length === 0) {
                    setTables(analysisData.suggestedTables);
                }
            } else if (!analysisData.analysisComplete && analysisStatus === "pending") {
                setAnalysisStatus("processing");
            }
        }
    }, [analysisData, analysisStatus, fields.length, tables.length, shouldFetchAnalysis]);

    const handleUpdateWorkflow = () => {
        updateWorkflow.mutate({
            name: workflowName,
            fields,
        });
    };

    const handleExtractData = () => {
        extractData.mutate(
            { fileId, fields, tables },
            {
                onSuccess: (data) => {
                    setExtractionResult(data.extractionResult);
                },
            },
        );
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("workflow-configure-view-mode", mode);
    };

    const handleFieldAdd = (newField: ExtractionField) => {
        setFields((prev) => [...prev, newField]);
    };

    const handleFieldRemove = (fieldIndex: number) => {
        setFields((prev) => prev.filter((_, index) => index !== fieldIndex));
    };

    if (isLoading) {
        return (
            <div className="w-full px-4 py-8">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading workflow...</p>
                </div>
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="w-full px-4 py-8">
                <div className="text-center">
                    <p className="text-red-500">Workflow not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Configure Workflow</h1>
                    <p className="text-muted-foreground">Review and save your workflow configuration.</p>
                </div>
                {fields.length > 0 && <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />}
            </div>

            {/* Document Preview and Extracted Values */}
            {fields.length > 0 && (
                <>
                    {viewMode === "split" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Panel - Document Preview */}
                            <div className="lg:sticky lg:top-4 lg:h-fit">
                                <DocumentPreview fileId={fileId} />
                            </div>

                            {/* Right Panel - Extracted Values */}
                            <div>
                                <ExtractedValues
                                    extractionResult={extractionResult}
                                    fields={fields}
                                    tables={tables}
                                    isLoading={extractData.isPending}
                                    onFieldUpdate={(index, updatedField) => {
                                        const newFields = [...fields];
                                        newFields[index] = updatedField;
                                        setFields(newFields);
                                    }}
                                    onFieldAdd={handleFieldAdd}
                                    onFieldRemove={handleFieldRemove}
                                    onTableUpdate={(index, updatedTable) => {
                                        const newTables = [...tables];
                                        newTables[index] = updatedTable;
                                        setTables(newTables);
                                    }}
                                    onExtractData={() => {
                                        if (fileId) {
                                            extractData.mutate(
                                                { fileId, fields, tables },
                                                {
                                                    onSuccess: (data) => {
                                                        setExtractionResult(data.extractionResult);
                                                    },
                                                },
                                            );
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Grid View - Categorized Fields */}
                            <FieldCategoryGrid
                                fields={fields}
                                extractionResult={extractionResult}
                                onFieldUpdate={(index, updatedField) => {
                                    const newFields = [...fields];
                                    newFields[index] = updatedField;
                                    setFields(newFields);
                                }}
                                onFieldAdd={handleFieldAdd}
                                onFieldRemove={handleFieldRemove}
                                onExtractData={() => {
                                    if (fileId) {
                                        extractData.mutate(
                                            { fileId, fields, tables },
                                            {
                                                onSuccess: (data) => {
                                                    setExtractionResult(data.extractionResult);
                                                },
                                            },
                                        );
                                    }
                                }}
                            />
                        </div>
                    )}
                    <Card>
                        <CardHeader>
                            <CardTitle>Save Workflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="workflow-name">Workflow Name</Label>
                                        <Input
                                            id="workflow-name"
                                            value={workflowName}
                                            onChange={(e) => setWorkflowName(e.target.value)}
                                            placeholder="Enter workflow name"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>Fields: {fields.length} configured</p>
                                            <p>Tables: {tables.length} configured</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="space-x-2">
                                        <Button variant="outline" onClick={() => navigate({ to: "/" })}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={handleExtractData}
                                            disabled={extractData.isPending || !fileId}
                                        >
                                            {extractData.isPending ? "Extracting..." : "Test Extraction"}
                                        </Button>
                                    </div>

                                    <Button
                                        onClick={handleUpdateWorkflow}
                                        disabled={updateWorkflow.isPending || !workflowName.trim()}
                                        size="lg"
                                    >
                                        {updateWorkflow.isPending ? "Saving Workflow..." : "Save Workflow"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
