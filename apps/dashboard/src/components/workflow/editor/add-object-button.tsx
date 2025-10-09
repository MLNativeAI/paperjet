import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectEditorSheet } from "@/components/workflow/editor/object-editor-sheet";

export function AddObjectButton() {
  return (
    <ObjectEditorSheet
      mode="add"
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Object
        </Button>
      }
    />
  );
}
