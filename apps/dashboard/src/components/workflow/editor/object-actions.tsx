import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldEditorSheet } from "@/components/workflow/editor/field-editor-sheet";
import { TableEditorSheet } from "@/components/workflow/editor/table-editor-sheet";
import type { DraftObject } from "@/types";

export function ObjectActions({ draftObject }: { draftObject: DraftObject }) {
  return (
    <div className="flex justify-between gap-2">
      <div className="flex gap-2">
        <FieldEditorSheet
          objectId={draftObject.id}
          mode="add"
          trigger={
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          }
        />
        <TableEditorSheet
          draftObject={draftObject}
          mode="add"
          trigger={
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          }
        />
      </div>
    </div>
  );
}
