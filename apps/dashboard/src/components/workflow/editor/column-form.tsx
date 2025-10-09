import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DraftColumn } from "@/types";

interface ColumnFormProps {
  draftColumn: DraftColumn;
  onUpdateColumn?: (updatedColumn: DraftColumn) => void;
  onRemoveColumn?: (columnId: string) => void;
}

export function ColumnForm({ draftColumn, onUpdateColumn, onRemoveColumn }: ColumnFormProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedColumn = {
      ...draftColumn,
      name: e.target.value,
    };

    onUpdateColumn?.(updatedColumn);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedColumn = {
      ...draftColumn,
      description: e.target.value,
    };

    onUpdateColumn?.(updatedColumn);
  };

  const handleTypeChange = (value: string) => {
    const updatedColumn = {
      ...draftColumn,
      type: value as "string" | "date" | "number",
    };

    onUpdateColumn?.(updatedColumn);
  };

  const handleRemove = () => {
    onRemoveColumn?.(draftColumn.id);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <Input
          id={`column-name-${draftColumn.id}`}
          value={draftColumn.name}
          onChange={handleNameChange}
          placeholder="Column name"
        />
        <Button variant="ghost" size="icon" onClick={handleRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Input
        id={`column-name-${draftColumn.id}`}
        value={draftColumn.description}
        onChange={handleDescChange}
        placeholder="Description"
      />
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-2">
          <Select value={draftColumn.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
