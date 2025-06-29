import type { ExtractionField } from "@paperjet/db/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddFieldFormProps {
    onFieldAdd?: (newField: ExtractionField) => void;
    onExtractData?: () => void;
    onCancel: () => void;
}

export function AddFieldForm({ onFieldAdd, onExtractData, onCancel }: AddFieldFormProps) {
    const [newField, setNewField] = useState<ExtractionField>({
        name: "",
        description: "",
        type: "text",
        required: false,
    });

    const handleAdd = () => {
        if (newField.name && newField.description && onFieldAdd) {
            onFieldAdd(newField);
            setNewField({
                name: "",
                description: "",
                type: "text",
                required: false,
            });
            if (onExtractData) {
                onExtractData();
            }
        }
        onCancel();
    };

    const handleCancel = () => {
        setNewField({
            name: "",
            description: "",
            type: "text",
            required: false,
        });
        onCancel();
    };

    return (
        <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">Add New Field</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                            className="h-6 w-6 p-0"
                        >
                            ×
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs font-medium mb-1 block">Field Name</Label>
                            <Input
                                value={newField.name}
                                onChange={(e) =>
                                    setNewField((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="e.g. invoice_number"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-medium mb-1 block">Type</Label>
                            <Select
                                value={newField.type}
                                onValueChange={(value) =>
                                    setNewField((prev) => ({
                                        ...prev,
                                        type: value as ExtractionField["type"],
                                    }))
                                }
                            >
                                <SelectTrigger className="h-8 text-sm">
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
                    </div>

                    <div>
                        <Label className="text-xs font-medium mb-1 block">Description</Label>
                        <Textarea
                            value={newField.description}
                            onChange={(e) =>
                                setNewField((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="Describe what this field should extract..."
                            className="text-sm min-h-[60px]"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleAdd}
                            disabled={!newField.name || !newField.description}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Field
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}