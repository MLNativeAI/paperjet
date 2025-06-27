import type { ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DocumentPreview } from "@/components/document-preview";
import { ExtractedValues } from "@/components/extracted-values";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useWorkflowAnalysis } from "@/hooks/useWorkflowAnalysis";

export default function WorkflowConfigurePage() {
    const navigate = useNavigate();
    const { workflowId } = useParams({ from: "/_app/workflows/$workflowId/configure" });
    const [workflowName, setWorkflowName] = useState("");
    const [fields, setFields] = useState<ExtractionField[]>([]);
    const [tables, setTables] = useState<ExtractionTable[]>([]);
    const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
    const [fileId, setFileId] = useState<string>("");
    const [analysisStatus, setAnalysisStatus] = useState<"pending" | "processing" | "completed">("pending");

    const { workflow, isLoading, updateWorkflow, extractData } = useWorkflow(workflowId);
    const { analysisData } = useWorkflowAnalysis(workflowId);

    // Initialize state when workflow data loads
    useEffect(() => {
        if (workflow) {
            setWorkflowName(workflow.name);
            setFields(workflow.configuration.fields);
            setTables(workflow.configuration.tables);
            setFileId(workflow.fileId || "");

            // Set initial analysis status based on workflow data
            setAnalysisStatus("completed");
        }
    }, [workflow]);

    // Update state when analysis completes
    useEffect(() => {
        if (analysisData) {
            if (analysisData.analysisComplete && analysisStatus !== "completed") {
                setAnalysisStatus("completed");

                // Update workflow name in state
                setWorkflowName(`${analysisData.documentType} Workflow`);
            } else if (!analysisData.analysisComplete && analysisStatus === "pending") {
                setAnalysisStatus("processing");
            }
        }
    }, [analysisData, analysisStatus]);

    const handleUpdateWorkflow = () => {
        updateWorkflow.mutate({
            name: workflowName,
            configuration: { fields, tables },
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
            <div className="">
                <h1 className="text-3xl font-bold mb-2">Configure Workflow</h1>
                <p className="text-muted-foreground">Review and save your workflow configuration.</p>
            </div>

            {/* Document Preview and Extracted Values */}
            {fields.length > 0 && (
                <>
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
                                onExtract={handleExtractData}
                            />
                        </div>
                    </div>
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
                                    <Button variant="outline" onClick={() => navigate({ to: "/" })}>
                                        Cancel
                                    </Button>

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
