import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useWorkflowConfig } from "@/components/workflow/editor/workflow-config-context";
import type { DraftField } from "@/types";

interface FieldEditorSheetProps {
  objectId: string;
  draftField?: DraftField;
  mode: "add" | "edit";
  trigger?: React.ReactNode;
  onFieldAdded?: () => void;
}

export function FieldEditorSheet({ objectId, draftField, mode, trigger, onFieldAdded }: FieldEditorSheetProps) {
  const { updateField, addField } = useWorkflowConfig();
  const [name, setName] = useState(draftField?.name || "");
  const [description, setDescription] = useState(draftField?.description || "");
  const [type, setType] = useState<DraftField["type"]>(draftField?.type || "string");

  const handleSave = () => {
    if (mode === "edit" && draftField) {
      updateField(objectId, draftField.id, {
        ...draftField,
        name,
        description,
        type,
      });
    } else if (mode === "add") {
      // Add a new field with the provided details
      addField(objectId, {
        id: new Date().toISOString(),
        name,
        description,
        type,
      });

      if (onFieldAdded) {
        onFieldAdded();
      }
    }
  };

  const defaultTrigger =
    mode === "edit" ? (
      <Button variant="ghost" size="sm" className="h-8 px-2">
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
    ) : (
      <Button variant="ghost" size="sm" className="h-8 px-2">
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    );

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{mode === "edit" ? "Edit Field" : "Add Field"}</SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? "Modify the field details here. Click save when you're done."
              : "Enter the field details here. Click save when you're done."}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-6 px-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">Name</Label>
              <Input
                id="field-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter field name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-description">Description</Label>
              <Textarea
                id="field-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description is optional and helps with accurate data extraction."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as DraftField["type"])}>
                <SelectTrigger id="field-type">
                  <SelectValue placeholder="Select type" />
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
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
