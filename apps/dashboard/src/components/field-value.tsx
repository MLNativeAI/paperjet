import type { ExtractionField, ExtractionResult } from "@paperjet/db/types";
import { ChevronDown, ChevronRight, Edit3, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FieldEditor } from "./field-editor";

interface FieldValueProps {
    field: ExtractionField;
    fieldIndex: number;
    extractionResult: ExtractionResult | null;
    isExpanded: boolean;
    isEditing: boolean;
    onToggleExpansion: (fieldIndex: number) => void;
    onStartEdit: (fieldIndex: number, field: ExtractionField) => void;
    onFieldUpdate?: (fieldIndex: number, updatedField: ExtractionField) => void;
    onFieldRemove?: (fieldIndex: number) => void;
    onExtractData?: () => void;
    onCancelEdit: () => void;
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

export function FieldValue({
    field,
    fieldIndex,
    extractionResult,
    isExpanded,
    isEditing,
    onToggleExpansion,
    onStartEdit,
    onFieldUpdate,
    onFieldRemove,
    onExtractData,
    onCancelEdit,
}: FieldValueProps) {
    const extractedValue = extractionResult?.fields?.find(
        (f) => f.fieldName === field.name,
    );

    return (
        <Collapsible
            key={`field-${field.name}-${fieldIndex}`}
            open={isExpanded}
            onOpenChange={() => onToggleExpansion(fieldIndex)}
        >
            <Card className="border">
                <CollapsibleTrigger asChild>
                    <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="text-base font-medium">
                                        {extractionResult ? (
                                            formatValue(extractedValue?.value, field.type)
                                        ) : (
                                            <span className="text-muted-foreground italic">
                                                No extraction run yet
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-muted-foreground">
                                            {field.name}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {field.type}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="pt-0 px-4 pb-4">
                        <div className="border-t pt-4">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium w-32">
                                            Field Name
                                        </TableCell>
                                        <TableCell>{field.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Type</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{field.type}</Badge>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Description
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {field.description}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Extracted Value
                                        </TableCell>
                                        <TableCell>
                                            {extractionResult ? (
                                                formatValue(
                                                    extractedValue?.value,
                                                    field.type,
                                                )
                                            ) : (
                                                <span className="text-muted-foreground italic">
                                                    No extraction run yet
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    {isEditing ? (
                                        <TableRow>
                                            <TableCell className="font-medium">
                                                Edit
                                            </TableCell>
                                            <TableCell>
                                                <FieldEditor
                                                    field={field}
                                                    fieldIndex={fieldIndex}
                                                    onFieldUpdate={onFieldUpdate}
                                                    onExtractData={onExtractData}
                                                    onCancel={onCancelEdit}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell className="font-medium">
                                                Actions
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onStartEdit(fieldIndex, field);
                                                        }}
                                                        className="h-8"
                                                    >
                                                        <Edit3 className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (onFieldRemove) {
                                                                onFieldRemove(fieldIndex);
                                                            }
                                                        }}
                                                        className="h-8 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}