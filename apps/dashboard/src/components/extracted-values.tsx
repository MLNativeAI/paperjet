import type { ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddFieldForm } from "./add-field-form";
import { ExtractedTable } from "./extracted-table";
import { FieldValue } from "./field-value";
import { LoadingSkeleton } from "./loading-skeleton";

interface ExtractedValuesProps {
    extractionResult: ExtractionResult | null;
    fields: ExtractionField[];
    tables: ExtractionTable[];
    isLoading?: boolean;
    onFieldUpdate?: (fieldIndex: number, updatedField: ExtractionField) => void;
    onFieldAdd?: (newField: ExtractionField) => void;
    onFieldRemove?: (fieldIndex: number) => void;
    onTableUpdate?: (tableIndex: number, updatedTable: ExtractionTable) => void;
    onExtractData?: () => void;
}

export function ExtractedValues({
    extractionResult,
    fields,
    tables,
    isLoading = false,
    onFieldUpdate,
    onFieldAdd,
    onFieldRemove,
    onExtractData,
}: ExtractedValuesProps) {
    const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set());
    const [editingField, setEditingField] = useState<number | null>(null);
    const [isAddingField, setIsAddingField] = useState(false);

    const toggleFieldExpansion = (fieldIndex: number) => {
        setExpandedFields((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(fieldIndex)) {
                newSet.delete(fieldIndex);
            } else {
                newSet.add(fieldIndex);
            }
            return newSet;
        });
    };
    const handleStartEdit = (fieldIndex: number) => {
        setEditingField(fieldIndex);
    };

    const handleCancelEdit = () => {
        setEditingField(null);
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="space-y-4">
            {/* Field Values */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <span>Extracted Values</span>
                        </CardTitle>
                        <Button size="sm" onClick={() => setIsAddingField(true)} className="h-8">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Field
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {fields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No fields configured</div>
                    ) : (
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <FieldValue
                                    key={`field-${field.name}-${index}`}
                                    field={field}
                                    fieldIndex={index}
                                    extractionResult={extractionResult}
                                    isExpanded={expandedFields.has(index)}
                                    isEditing={editingField === index}
                                    onToggleExpansion={toggleFieldExpansion}
                                    onStartEdit={handleStartEdit}
                                    onFieldUpdate={onFieldUpdate}
                                    onFieldRemove={onFieldRemove}
                                    onExtractData={onExtractData}
                                    onCancelEdit={handleCancelEdit}
                                />
                            ))}

                            {isAddingField && <AddFieldForm onFieldAdd={onFieldAdd} onExtractData={onExtractData} onCancel={() => setIsAddingField(false)} />}
                        </div>
                    )}
                </CardContent>
            </Card>

            {tables.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>Extracted Tables</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {tables.map((table, tableIndex) => (
                                <ExtractedTable
                                    key={`table-${table.name}-${tableIndex}`}
                                    table={table}
                                    tableIndex={tableIndex}
                                    extractionResult={extractionResult}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
