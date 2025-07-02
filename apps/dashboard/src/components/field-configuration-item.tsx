import type { ExtractionField, ExtractionResult } from "@paperjet/db/types";
import { Edit3, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FieldConfigurationItemProps {
    field: ExtractionField;
    fieldIndex: number;
    extractionResult: ExtractionResult | null;
    isEditing: boolean;
    onStartEdit: (index: number) => void;
    onSaveEdit: (index: number) => void;
    onCancelEdit: () => void;
    onUpdateField: (index: number, updates: Partial<ExtractionField>) => void;
}

const formatValue = (value: unknown, type: string) => {
    if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic">No data found</span>;
    }

    switch (type) {
        case "currency":
            return typeof value === "number" ? `$${value.toFixed(2)}` : value;
        case "date":
            return value;
        case "boolean":
            return value ? "Yes" : "No";
        default:
            return value.toString();
    }
};

export function FieldConfigurationItem({
    field,
    fieldIndex,
    extractionResult,
    isEditing,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onUpdateField,
}: FieldConfigurationItemProps) {
    return (
        <div key={field.name} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Label className="font-medium">{field.name}</Label>
                        <Badge variant="outline" className="text-xs">
                            {field.type}
                        </Badge>
                    </div>

                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={field.description}
                                onChange={(e) => onUpdateField(fieldIndex, { description: e.target.value })}
                                placeholder="Field description for AI extraction"
                                className="text-sm"
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => onSaveEdit(fieldIndex)}>
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between">
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                            <Button size="sm" variant="ghost" onClick={() => onStartEdit(fieldIndex)} className="ml-2">
                                <Edit3 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {extractionResult && (
                <div className="mt-3 p-3 bg-muted rounded border-l-4 border-l-blue-500">
                    <Label className="text-xs font-medium text-muted-foreground">EXTRACTED VALUE</Label>
                    <div className="mt-1 text-sm font-medium">
                        {formatValue(extractionResult.fields.find((f) => f.fieldName === field.name)?.value, field.type)}
                    </div>
                </div>
            )}
        </div>
    );
}
