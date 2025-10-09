import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ColumnList } from "@/components/workflow/editor/column-list";
import { useWorkflowConfig } from "@/components/workflow/editor/workflow-config-context";
import type { DraftObject, DraftTable } from "@/types";

interface TableEditorSheetProps {
  draftObject: DraftObject;
  initialTable?: DraftTable;
  mode: "add" | "edit";
  trigger: React.ReactNode;
}

export function TableEditorSheet({ draftObject, initialTable, mode, trigger }: TableEditorSheetProps) {
  const { addTable, updateTable } = useWorkflowConfig();
  const [draftTable, setDraftTable] = useState<DraftTable>(
    initialTable || { id: "", name: "", description: "", columns: [] },
  );
  const [isOpen, setIsOpen] = useState(false);

  const { name, description } = draftTable;

  const handleSave = () => {
    if (mode === "edit" && draftTable) {
      updateTable(draftObject.id, draftTable.id, draftTable);
    } else if (mode === "add") {
      const newTable: DraftTable = {
        id: Date.now().toString(),
        name: draftTable.name,
        description: draftTable.description,
        columns: draftTable.columns || [],
      };

      addTable(draftObject.id, newTable);
    }
    setIsOpen(false);
  };

  const setName = (name: string) => {
    setDraftTable((prev) => ({ ...prev, name }));
  };

  const setDescription = (description: string) => {
    setDraftTable((prev) => ({ ...prev, description }));
  };

  const defaultTrigger =
    mode === "edit" ? (
      <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
        <Pencil className="h-4 w-4 " />
      </Button>
    ) : (
      <Button variant="ghost" size="sm" className="h-8 px-2">
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{mode === "edit" ? "Edit Table" : "Add Table"}</SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? "Modify the table details here. Click save when you're done."
              : "Enter the table details here. Click save when you're done."}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-6 px-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table-name">Name</Label>
              <Input
                id="table-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter table name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="table-description">Description</Label>
              <Textarea
                id="table-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description is optional and helps with accurate data extraction."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">Columns</h3>
              </div>
              <ColumnList draftObject={draftObject} draftTable={draftTable} onUpdateTable={setDraftTable} />
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </SheetClose>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
