import { useState } from "react";
import type { Workflow } from "@paperjet/engine/types";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoryGroup } from "./workflow-categories";
import EditFieldSheet from "./edit-field-sheet";

export default function WorkflowFields({ category, workflow }: { category: CategoryGroup; workflow: Workflow }) {
    const [editingField, setEditingField] = useState<typeof category.fields[number] | null>(null);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Get sample data for fields
    const getSampleValue = (fieldName: string) => {
        if (!workflow.sampleData?.fields) return null;
        const sampleField = workflow.sampleData.fields.find((f) => f.fieldName === fieldName);
        return sampleField?.value;
    };

    const handleEditField = (field: typeof category.fields[number]) => {
        setEditingField(field);
        setIsEditSheetOpen(true);
    };

    const handleSaveField = (updatedField: typeof category.fields[number]) => {
        // TODO: Implement API call to save the field
        console.log("Saving field:", updatedField);
        setIsEditSheetOpen(false);
    };

    return (
        <>
            {category.fields.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-md font-medium">Fields</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {category.fields.map((field) => {
                            const sampleValue = getSampleValue(field.name);
                            return (
                                <div key={field.name} className="group relative p-4 border rounded-lg bg-card">
                                    {/* Edit Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleEditField(field)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    {/* Field Content */}
                                    {sampleValue !== null && sampleValue !== undefined ? (
                                        <div className="space-y-2">
                                            <p className="text-base font-medium pr-8">{String(sampleValue)}</p>
                                            <p className="text-sm text-muted-foreground">{field.name}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-base font-medium text-muted-foreground pr-8">
                                                No sample value
                                            </p>
                                            <p className="text-sm text-muted-foreground">{field.name}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Edit Field Sheet */}
            <EditFieldSheet
                field={editingField}
                isOpen={isEditSheetOpen}
                onClose={() => setIsEditSheetOpen(false)}
                onSave={handleSaveField}
            />
        </>
    );
}
