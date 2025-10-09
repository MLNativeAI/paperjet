import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFieldIconByType } from "@/components/utils";
import { TableEditorSheet } from "@/components/workflow/editor/table-editor-sheet";
import { useWorkflowConfig } from "@/components/workflow/editor/workflow-config-context";
import type { DraftColumn, DraftObject, DraftTable } from "@/types";

interface TableListProps {
  draftObject: DraftObject;
}

export function TableList({ draftObject }: TableListProps) {
  return (
    <div className="space-y-6">
      {draftObject.tables && draftObject.tables.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md text-muted-foreground">Tables</h3>
          </div>
          <div className="w-full space-y-3">
            {draftObject.tables.map((table) => (
              <TableCard key={table.id} objectId={draftObject.id} table={table} draftObject={draftObject} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TableCard({
  objectId,
  table,
  draftObject,
}: {
  objectId: string;
  table: DraftTable;
  draftObject: DraftObject;
}) {
  const { removeTable } = useWorkflowConfig();

  return (
    <div className="flex flex-col p-3 bg-muted/30 rounded-lg border gap-4">
      <div className="flex items-center justify-between">
        <span className="text-md font-medium">{table.name}</span>
        <div className="flex gap-2">
          <TableEditorSheet
            draftObject={draftObject}
            initialTable={table}
            mode="edit"
            trigger={
              <Button size="sm" variant="ghost">
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
          />
          <Button size="sm" variant="ghost" onClick={() => removeTable(objectId, table.id)}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground flex-grow">
        {table.description || <span className="opacity-0">No description</span>}
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-md text-muted-foreground">Columns</h3>
        <div>
          {table.columns.map((column) => (
            <ColumnRow column={column} key={column.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ColumnRow({ column }: { column: DraftColumn }) {
  return (
    <div key={column.id} className="flex flex-col p-3 ">
      <div className="flex items-center justify-between">
        <span className="text-md font-medium flex items-center gap-2">
          {getFieldIconByType(column.type)}
          {column.name}
        </span>
      </div>
    </div>
  );
}
