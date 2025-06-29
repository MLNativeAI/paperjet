import type { ExtractionField } from "@paperjet/db/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FieldEditorProps {
    field: ExtractionField;
    fieldIndex: number;
    onFieldUpdate?: (fieldIndex: number, updatedField: ExtractionField) => void;
    onExtractData?: () => void;
    onCancel: () => void;
}

export function FieldEditor({
    field,
    fieldIndex,
    onFieldUpdate,
    onExtractData,
    onCancel,
}: FieldEditorProps) {
    const [tempField, setTempField] = useState<ExtractionField>(field);

    const handleSave = () => {
        if (onFieldUpdate) {
            onFieldUpdate(fieldIndex, tempField);
            if (onExtractData) {
                onExtractData();
            }
        }
        onCancel();
    };

    return (
        <div className="space-y-3">
            <div>
                <Label className="text-xs font-medium mb-1 block">
                    Field Name
                </Label>
                <Input
                    value={tempField.name}
                    onChange={(e) =>
                        setTempField((prev) => ({
                            ...prev,
                            name: e.target.value,
                        }))
                    }
                    className="h-8 text-sm"
                />
            </div>
            <div>
                <Label className="text-xs font-medium mb-1 block">
                    Type
                </Label>
                <Select
                    value={tempField.type}
                    onValueChange={(value) =>
                        setTempField((prev) => ({
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
            <div>
                <Label className="text-xs font-medium mb-1 block">
                    Description
                </Label>
                <Textarea
                    value={tempField.description}
                    onChange={(e) =>
                        setTempField((prev) => ({
                            ...prev,
                            description: e.target.value,
                        }))
                    }
                    className="text-sm min-h-[60px]"
                    placeholder="Describe what this field should extract..."
                />
            </div>
            <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                    Save
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}