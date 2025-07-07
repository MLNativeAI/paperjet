import type { CategoriesConfiguration } from "@paperjet/engine/types";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
} from "@/components/ui/sheet";

interface ConfigureSectionsSheetProps {
  categories: CategoriesConfiguration;
  isOpen: boolean;
  onClose: () => void;
  onSave: (categories: CategoriesConfiguration) => void;
}

export default function ConfigureSectionsSheet({ categories, isOpen, onClose, onSave }: ConfigureSectionsSheetProps) {
  const [editedCategories, setEditedCategories] = useState<CategoriesConfiguration>([]);

  // Update local state when categories prop changes
  useEffect(() => {
    setEditedCategories([...categories]);
  }, [categories]);

  const handleAddSection = () => {
    const newCategory = {
      categoryId: `cat_${editedCategories.length + 1}`,
      slug: `new_section_${editedCategories.length + 1}`,
      displayName: `New Section ${editedCategories.length + 1}`,
      ordinal: editedCategories.length,
    };
    setEditedCategories([...editedCategories, newCategory]);
  };

  const handleRemoveSection = (categoryId: string) => {
    const filtered = editedCategories.filter((cat) => cat.categoryId !== categoryId);
    // Reorder ordinals
    const reordered = filtered.map((cat, index) => ({
      ...cat,
      ordinal: index,
    }));
    setEditedCategories(reordered);
  };

  const handleRenameSection = (categoryId: string, newName: string) => {
    setEditedCategories(
      editedCategories.map((cat) =>
        cat.categoryId === categoryId
          ? {
              ...cat,
              displayName: newName,
              slug: newName.toLowerCase().replace(/\s+/g, "_"),
            }
          : cat,
      ),
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCategories = [...editedCategories];
    [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
    // Update ordinals
    const reordered = newCategories.map((cat, idx) => ({
      ...cat,
      ordinal: idx,
    }));
    setEditedCategories(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === editedCategories.length - 1) return;
    const newCategories = [...editedCategories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    // Update ordinals
    const reordered = newCategories.map((cat, idx) => ({
      ...cat,
      ordinal: idx,
    }));
    setEditedCategories(reordered);
  };

  const handleSave = () => {
    onSave(editedCategories);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[540px]">
        <SheetHeader>
          <SheetTitle>Configure sections</SheetTitle>
          <SheetDescription>Add, remove, or rename sections to organize your workflow fields.</SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-4 px-4 py-4">
          {/* Sections List */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Sections</Label>
              <Button size="sm" variant="outline" onClick={handleAddSection} className="h-8">
                <Plus className="h-3 w-3 mr-1" />
                Add Section
              </Button>
            </div>

            <div className="space-y-2">
              {editedCategories.map((category, index) => (
                <div key={category.categoryId} className="flex items-center gap-2 p-2 border rounded-lg">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === editedCategories.length - 1}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Section Name Input */}
                  <Input
                    value={category.displayName}
                    onChange={(e) => handleRenameSection(category.categoryId, e.target.value)}
                    className="flex-1"
                    placeholder="Section name"
                  />

                  {/* Remove Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveSection(category.categoryId)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {editedCategories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No sections yet. Click "Add Section" to create one.
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave}>Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
