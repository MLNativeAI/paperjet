import type { ExtractionField, ExtractionResult } from "@paperjet/db/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddFieldForm } from "./add-field-form";
import { CategorySection } from "./category-section";
import { Button } from "./ui/button";

interface FieldCategoryGridProps {
    fields: ExtractionField[];
    extractionResult: ExtractionResult | null;
    onFieldUpdate?: (fieldIndex: number, updatedField: ExtractionField) => void;
    onFieldAdd?: (newField: ExtractionField) => void;
    onFieldRemove?: (fieldIndex: number) => void;
    onExtractData?: () => void;
}

export function FieldCategoryGrid({ fields, extractionResult, onFieldUpdate, onFieldAdd, onFieldRemove, onExtractData }: FieldCategoryGridProps) {
    const [isAddingField, setIsAddingField] = useState(false);

    // Group fields by category
    const fieldsByCategory = fields.reduce(
        (acc, field, index) => {
            const category = field.category?.displayName || field.category || "General Information";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ field, originalIndex: index });
            return acc;
        },
        {} as Record<string, Array<{ field: ExtractionField; originalIndex: number }>>,
    );

    const categories = Object.keys(fieldsByCategory).sort();

    if (fields.length === 0 && !isAddingField) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No fields configured</p>
                <Button onClick={() => setIsAddingField(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Add Field Button */}
            <div className="flex justify-end">
                <Button size="sm" onClick={() => setIsAddingField(true)} className="h-8">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Field
                </Button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {categories.map((categoryName) => {
                    const categoryFields = fieldsByCategory[categoryName];
                    const startingIndex = categoryFields[0]?.originalIndex ?? 0;

                    return (
                        <CategorySection
                            key={categoryName}
                            categoryName={categoryName}
                            fields={categoryFields.map((cf) => cf.field)}
                            extractionResult={extractionResult}
                            onFieldUpdate={(localIndex, updatedField) => {
                                const globalIndex = categoryFields[localIndex]?.originalIndex;
                                if (globalIndex !== undefined && onFieldUpdate) {
                                    onFieldUpdate(globalIndex, updatedField);
                                }
                            }}
                            onFieldRemove={(localIndex) => {
                                const globalIndex = categoryFields[localIndex]?.originalIndex;
                                if (globalIndex !== undefined && onFieldRemove) {
                                    onFieldRemove(globalIndex);
                                }
                            }}
                            onExtractData={onExtractData}
                            startingFieldIndex={startingIndex}
                        />
                    );
                })}
            </div>

            {/* Add Field Form */}
            {isAddingField && (
                <div className="max-w-md">
                    <AddFieldForm onFieldAdd={onFieldAdd} onExtractData={onExtractData} onCancel={() => setIsAddingField(false)} />
                </div>
            )}
        </div>
    );
}
