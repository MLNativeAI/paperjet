import type { ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/DocumentPreview";
import { ExtractedValues } from "@/components/ExtractedValues";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface WorkflowAnalysisResultProps {
    analysis: {
        fileId: string;
        analysis: {
            documentType: string;
            suggestedFields: ExtractionField[];
            suggestedTables: ExtractionTable[];
        };
    };
    fileId: string;
}

export function WorkflowAnalysisResult({ analysis, fileId }: WorkflowAnalysisResultProps) {
    const navigate = useNavigate();
    const [workflowName, setWorkflowName] = useState(`${analysis.analysis.documentType} Workflow`);
    const [fields, setFields] = useState<ExtractionField[]>(analysis.analysis.suggestedFields);
    const [tables, setTables] = useState<ExtractionTable[]>(analysis.analysis.suggestedTables);
    const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

    const extractData = useMutation({
        mutationFn: async () => {
            const response = await fetch("/api/workflows/extract", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    fileId,
                    fields,
                    tables,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to extract data");
            }

            return response.json();
        },
        onSuccess: (data) => {
            setExtractionResult(data.extractionResult);
        },
        onError: () => {
            toast.error("Failed to extract data from document");
        },
    });

    const createWorkflow = useMutation({
        mutationFn: async () => {
            const response = await api.workflows.$post({
                json: {
                    name: workflowName,
                    configuration: { fields, tables },
                    fileId,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to create workflow");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success("Workflow created successfully!");
            navigate({ to: "/" });
        },
        onError: () => {
            toast.error("Failed to create workflow");
        },
    });

    const handleCreateWorkflow = () => {
        createWorkflow.mutate();
    };

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Workflow configuration</h1>
                <p className="text-muted-foreground">
                    Detected document type: <span className="font-semibold">{analysis.analysis.documentType}</span>
                </p>
                <p className="text-muted-foreground">Review extracted data and save your workflow.</p>
            </div>

            {/* Side-by-side: Document Preview and Extracted Values */}
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
                    />
                </div>
            </div>

            {/* Save Workflow Section - Full Width */}
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
                                    <p>Document Type: {analysis.analysis.documentType}</p>
                                    <p>Fields: {fields.length} configured</p>
                                    <p>Tables: {tables.length} configured</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Start Over
                            </Button>

                            <Button
                                onClick={handleCreateWorkflow}
                                disabled={createWorkflow.isPending || !workflowName.trim()}
                                size="lg"
                            >
                                {createWorkflow.isPending ? "Creating Workflow..." : "Save Workflow"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
