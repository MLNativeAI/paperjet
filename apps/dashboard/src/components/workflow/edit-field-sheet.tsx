import type { FieldsConfiguration } from "@paperjet/engine/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface EditFieldSheetProps {
    field: FieldsConfiguration[number] | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (field: FieldsConfiguration[number]) => void;
}

export default function EditFieldSheet({ field, isOpen, onClose, onSave }: EditFieldSheetProps) {
    const [editedField, setEditedField] = useState<FieldsConfiguration[number] | null>(field);

    // Update local state when field prop changes
    useEffect(() => {
        setEditedField(field);
    }, [field]);

    const handleSave = () => {
        if (editedField) {
            onSave(editedField);
            onClose();
        }
    };

    if (!editedField) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit field</SheetTitle>
                    <SheetDescription>Make changes to the field configuration. Click save when you're done.</SheetDescription>
                </SheetHeader>

                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    {/* Field Name */}
                    <div className="grid gap-3">
                        <Label htmlFor="edit-field-name">Field Name</Label>
                        <Input id="edit-field-name" value={editedField.name} onChange={(e) => setEditedField({ ...editedField, name: e.target.value })} placeholder="e.g., invoice_number" />
                    </div>

                    {/* Field Type */}
                    <div className="grid gap-3">
                        <Label htmlFor="edit-field-type">Field Type</Label>
                        <Select value={editedField.type} onValueChange={(value) => setEditedField({ ...editedField, type: value as any })}>
                            <SelectTrigger id="edit-field-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="grid gap-3">
                        <Label htmlFor="edit-field-description">Description</Label>
                        <Textarea
                            id="edit-field-description"
                            value={editedField.description}
                            onChange={(e) => setEditedField({ ...editedField, description: e.target.value })}
                            placeholder="Detailed description for AI extraction..."
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Required Toggle */}
                    <div className="flex items-center gap-3">
                        <Switch id="edit-field-required" checked={editedField.required} onCheckedChange={(checked) => setEditedField({ ...editedField, required: checked })} />
                        <Label htmlFor="edit-field-required" className="cursor-pointer">
                            Required field
                        </Label>
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
