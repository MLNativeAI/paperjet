import type { ExtractionField, ExtractionResult } from "@paperjet/db/types";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldConfigurationItem } from "./field-configuration-item";

interface FieldConfigurationProps {
    fields: ExtractionField[];
    extractionResult: ExtractionResult | null;
    editingField: number | null;
    isExtracting: boolean;
    onStartEdit: (index: number) => void;
    onSaveEdit: (index: number) => void;
    onCancelEdit: () => void;
    onUpdateField: (index: number, updates: Partial<ExtractionField>) => void;
    onReExtract: () => void;
}

export function FieldConfiguration({ fields, extractionResult, editingField, isExtracting, onStartEdit, onSaveEdit, onCancelEdit, onUpdateField, onReExtract }: FieldConfigurationProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Field Configuration</span>
                    <Button size="sm" variant="outline" onClick={onReExtract} disabled={isExtracting}>
                        {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Re-extract
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <FieldConfigurationItem
                            key={field.name}
                            field={field}
                            fieldIndex={index}
                            extractionResult={extractionResult}
                            isEditing={editingField === index}
                            onStartEdit={onStartEdit}
                            onSaveEdit={onSaveEdit}
                            onCancelEdit={onCancelEdit}
                            onUpdateField={onUpdateField}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
