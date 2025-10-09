import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFieldIconByType } from "@/components/utils";
import { FieldEditorSheet } from "@/components/workflow/editor/field-editor-sheet";
import { useWorkflowConfig } from "@/components/workflow/editor/workflow-config-context";
import type { DraftField, DraftObject } from "@/types";

interface FieldListProps {
  draftObject: DraftObject;
}

export function FieldList({ draftObject }: FieldListProps) {
  return (
    <div className="space-y-6">
      {draftObject.fields && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md text-muted-foreground">Fields</h3>
          </div>
          {draftObject.fields && draftObject.fields.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 space-y-3">
              {draftObject.fields.map((field) => (
                <FieldCard objectId={draftObject.id} field={field} key={field.id} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No fields added yet</p>
          )}
        </div>
      )}
    </div>
  );
}

function FieldCard({ objectId, field }: { objectId: string; field: DraftField }) {
  const { removeField } = useWorkflowConfig();
  return (
    <div key={field.id} className="flex flex-col p-3 bg-muted/30 rounded-lg border h-[80px]">
      <div className="flex items-center justify-between">
        <span className="text-md font-medium flex items-center gap-2">
          {getFieldIconByType(field.type)}
          {field.name}
        </span>
        <div className="flex gap-2">
          <FieldEditorSheet
            mode="edit"
            objectId={objectId}
            draftField={field}
            trigger={
              <Button size="sm" variant="ghost">
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
          />
          <Button size="sm" variant="ghost" onClick={() => removeField(objectId, field.id)}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground flex-grow">
        {field.description || <span className="opacity-0">No description</span>}
      </div>
    </div>
  );
}
