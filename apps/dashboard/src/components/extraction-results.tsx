import type { DocumentAnalysis, ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateWorkflowButton } from "./create-workflow-button";
import { ExtractedTableDisplay } from "./extracted-table-display";
import { FieldConfiguration } from "./field-configuration";

interface ExtractionResultsProps {
    fileId: string;
    analysis: DocumentAnalysis;
    onCreateWorkflow: (fields: ExtractionField[], tables: ExtractionTable[]) => void;
    isCreatingWorkflow: boolean;
}

export function ExtractionResults({ fileId, analysis, onCreateWorkflow, isCreatingWorkflow }: ExtractionResultsProps) {
    const [fields, setFields] = useState<ExtractionField[]>(analysis.suggestedFields);
    const [tables, _setTables] = useState<ExtractionTable[]>(analysis.suggestedTables);
    const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
    const [editingField, setEditingField] = useState<number | null>(null);

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

    // Auto-extract when component mounts
    useEffect(() => {
        if (!extractionResult) {
            extractData.mutate();
        }
    }, [extractData.mutate, extractionResult]);

    const updateField = (index: number, updates: Partial<ExtractionField>) => {
        setFields(fields.map((field, i) => (i === index ? { ...field, ...updates } : field)));
    };

    const saveFieldEdit = (_index: number) => {
        setEditingField(null);
        // Re-extract data with updated field
        extractData.mutate();
    };


    return (
        <div className="space-y-4">
            <FieldConfiguration
                fields={fields}
                extractionResult={extractionResult}
                editingField={editingField}
                isExtracting={extractData.isPending}
                onStartEdit={setEditingField}
                onSaveEdit={saveFieldEdit}
                onCancelEdit={() => setEditingField(null)}
                onUpdateField={updateField}
                onReExtract={() => extractData.mutate()}
            />

            <ExtractedTableDisplay
                tables={tables}
                extractionResult={extractionResult}
            />

            <CreateWorkflowButton
                fields={fields}
                tables={tables}
                extractionResult={extractionResult}
                isCreatingWorkflow={isCreatingWorkflow}
                onCreateWorkflow={onCreateWorkflow}
            />
        </div>
    );
}
