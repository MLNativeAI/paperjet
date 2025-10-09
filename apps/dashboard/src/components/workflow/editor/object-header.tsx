import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectEditorSheet } from "@/components/workflow/editor/object-editor-sheet";
import { useWorkflowConfig } from "@/components/workflow/editor/workflow-config-context";
import type { DraftObject } from "@/types";

export function ObjectHeader({ draftObject }: { draftObject: DraftObject }) {
  const { removeObject } = useWorkflowConfig();

  return (
    <div className="py-3 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-4">
            <span className="font-medium">{draftObject.name || "Unnamed Object"}</span>
          </div>

          {draftObject.description && (
            <div className="flex items-start gap-4">
              <span className="text-muted-foreground text-sm">{draftObject.description}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ObjectEditorSheet draftObject={draftObject} mode="edit" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeObject(draftObject.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
