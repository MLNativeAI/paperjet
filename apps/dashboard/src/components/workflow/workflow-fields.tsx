import type { Workflow } from "@paperjet/engine/types";
import { useState } from "react";
import EditFieldSheet from "./edit-field-sheet";
import type { CategoryGroup } from "./workflow-categories";
import WorkflowFieldCard from "./workflow-field-card";

export default function WorkflowFields({ category, workflow }: { category: CategoryGroup; workflow: Workflow }) {
  const [editingField, setEditingField] = useState<(typeof category.fields)[number] | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Get sample data for fields
  const getSampleValue = (fieldName: string) => {
    if (!workflow.sampleData?.fields) return null;
    const sampleField = workflow.sampleData.fields.find((f) => f.fieldName === fieldName);
    return sampleField?.value;
  };

  const handleEditField = (field: (typeof category.fields)[number]) => {
    setEditingField(field);
    setIsEditSheetOpen(true);
  };

  return (
    <>
      {category.fields.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {category.fields.map((field) => {
            const sampleValue = getSampleValue(field.name);
            return (
              <WorkflowFieldCard
                key={field.id}
                field={field}
                sampleValue={sampleValue}
                sampleDataExtractedAt={workflow.sampleDataExtractedAt}
                onEdit={handleEditField}
              />
            );
          })}
        </div>
      )}

      {/* Edit Field Sheet */}
      <EditFieldSheet
        field={editingField}
        workflowId={workflow.id}
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
      />
    </>
  );
}
