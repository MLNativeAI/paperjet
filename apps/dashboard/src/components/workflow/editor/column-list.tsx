import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ColumnForm } from "@/components/workflow/editor/column-form";
import type { DraftColumn, DraftObject, DraftTable } from "@/types";

interface ColumnListProps {
  draftObject: DraftObject;
  draftTable: DraftTable;
  onUpdateTable: (updatedTable: DraftTable) => void;
}

export function ColumnList({ draftTable, onUpdateTable }: ColumnListProps) {
  const [newColumnName, setNewColumnName] = useState("");

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const newColumn: DraftColumn = {
        id: Date.now().toString(),
        name: newColumnName,
        type: "string",
      };

      const updatedTable = {
        ...draftTable,
        columns: [...(draftTable.columns || []), newColumn],
      };

      onUpdateTable(updatedTable);
      setNewColumnName("");
    }
  };

  const handleUpdateColumn = (updatedColumn: DraftColumn) => {
    const updatedTable = {
      ...draftTable,
      columns: draftTable.columns?.map((column) => (column.id === updatedColumn.id ? updatedColumn : column)) || [],
    };

    onUpdateTable(updatedTable);
  };

  const handleRemoveColumn = (columnId: string) => {
    const updatedTable = {
      ...draftTable,
      columns: draftTable.columns?.filter((column) => column.id !== columnId) || [],
    };

    onUpdateTable(updatedTable);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {draftTable.columns.map((column) => (
          <>
            <ColumnForm
              key={column.id}
              draftColumn={column}
              onUpdateColumn={handleUpdateColumn}
              onRemoveColumn={handleRemoveColumn}
            />
            <Separator />
          </>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          placeholder="Column name"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button size="sm" onClick={handleAddColumn} disabled={!newColumnName.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
