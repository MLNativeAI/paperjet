import type { ExtractionField, ExtractionResult } from "@paperjet/db/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldValue } from "./field-value";

interface CategorySectionProps {
    categoryName: string;
    fields: ExtractionField[];
    extractionResult: ExtractionResult | null;
    onFieldUpdate?: (fieldIndex: number, updatedField: ExtractionField) => void;
    onFieldRemove?: (fieldIndex: number) => void;
    onExtractData?: () => void;
    startingFieldIndex: number;
}

export function CategorySection({ categoryName, fields, extractionResult, onFieldUpdate, onFieldRemove, onExtractData, startingFieldIndex }: CategorySectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set());
    const [editingField, setEditingField] = useState<number | null>(null);

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

    if (fields.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 p-0 h-auto font-semibold text-base hover:bg-transparent">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {categoryName}
                    </Button>
                    <span className="text-sm font-normal text-muted-foreground">
                        {fields.length} field{fields.length !== 1 ? "s" : ""}
                    </span>
                </CardTitle>
            </CardHeader>
            {isExpanded && (
                <CardContent>
                    <div className="space-y-2">
                        {fields.map((field, index) => {
                            const globalFieldIndex = startingFieldIndex + index;
                            return (
                                <FieldValue
                                    key={`field-${field.name}-${globalFieldIndex}`}
                                    field={field}
                                    fieldIndex={globalFieldIndex}
                                    extractionResult={extractionResult}
                                    isExpanded={expandedFields.has(globalFieldIndex)}
                                    isEditing={editingField === globalFieldIndex}
                                    onToggleExpansion={toggleFieldExpansion}
                                    onStartEdit={handleStartEdit}
                                    onFieldUpdate={onFieldUpdate}
                                    onFieldRemove={onFieldRemove}
                                    onExtractData={onExtractData}
                                    onCancelEdit={handleCancelEdit}
                                />
                            );
                        })}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
