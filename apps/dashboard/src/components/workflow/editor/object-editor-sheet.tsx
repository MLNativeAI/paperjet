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
import { useWorkflowConfig } from "@/components/workflow/editor/workflow-config-context";
import type { DraftObject } from "@/types";

interface ObjectEditorSheetProps {
  draftObject?: DraftObject;
  mode: "add" | "edit";
  trigger?: React.ReactNode;
  onObjectAdded?: () => void;
}

export function ObjectEditorSheet({ draftObject, mode, trigger, onObjectAdded }: ObjectEditorSheetProps) {
  const { updateObject, addAnObject } = useWorkflowConfig();
  const [name, setName] = useState(draftObject?.name || "");
  const [description, setDescription] = useState(draftObject?.description || "");

  const handleSave = () => {
    if (mode === "edit" && draftObject) {
      updateObject({
        ...draftObject,
        name,
        description,
      });
    } else if (mode === "add") {
      // Add a new object with the provided details
      addAnObject({
        name,
        description,
      });

      // Call the callback if provided
      if (onObjectAdded) {
        onObjectAdded();
      }
    }
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
    <Sheet>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{mode === "edit" ? "Edit Object" : "Add Object"}</SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? "Modify the object details here. Click save when you're done."
              : "Enter the object details here. Click save when you're done."}
          </SheetDescription>
        </SheetHeader>{" "}
        <div className="py-4 space-y-6 px-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="object-name">Name</Label>
              <Input
                id="object-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter object name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="object-description">Description</Label>
              <Textarea
                id="object-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description is optional and helps with accurate data extraction."
                className="min-h-[80px]"
              />
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
