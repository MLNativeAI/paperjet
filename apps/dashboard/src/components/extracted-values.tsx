import type { ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { AlertTriangle, Edit3, Settings } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ExtractedValuesProps {
    extractionResult: ExtractionResult | null;
    fields: ExtractionField[];
    tables: ExtractionTable[];
    isLoading?: boolean;
    onFieldUpdate?: (fieldIndex: number, updatedField: ExtractionField) => void;
    onTableUpdate?: (tableIndex: number, updatedTable: ExtractionTable) => void;
    onExtractData?: () => void;
}

export function ExtractedValues({
    extractionResult,
    fields,
    tables,
    isLoading = false,
    onFieldUpdate,
    onTableUpdate,
    onExtractData,
}: ExtractedValuesProps) {
    const [editingField, setEditingField] = useState<number | null>(null);
    const [tempField, setTempField] = useState<ExtractionField | null>(null);
    const formatValue = (value: any, type: string) => {
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

    if (isLoading) {
        return (
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>Extracted Values</span>
                        <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Loading skeleton for fields */}
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="border-l-4 border-l-blue-500 bg-muted/50 rounded p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                                    <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
                                </div>
                                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-2" />
                                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                        <div className="text-center py-4">
                            <div className="relative mb-2">
                                <div className="h-8 w-8 rounded-full border-4 border-blue-200 mx-auto animate-pulse" />
                                <div className="absolute inset-0 h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent mx-auto animate-spin" />
                            </div>
                            <p className="text-sm text-blue-600 font-medium">Extracting data...</p>
                            <p className="text-xs text-muted-foreground mt-1">AI is processing your document</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Field Values */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>Extracted Values</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {fields.map((field, index) => {
                            const extractedValue = extractionResult?.fields?.find((f) => f.fieldName === field.name);
                            const isEditing = editingField === index;

                            return (
                                <Accordion
                                    key={index}
                                    type="single"
                                    collapsible
                                    className="border-l-4 border-l-blue-500 bg-muted/50 rounded"
                                >
                                    <AccordionItem value={`field-${index}`} className="border-none">
                                        <div className="p-3">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Label className="font-medium text-sm">{field.name}</Label>
                                                    <Badge variant="outline" className="text-xs">
                                                        {field.type}
                                                    </Badge>
                                                </div>
                                                <AccordionTrigger className="p-0 h-auto hover:no-underline">
                                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                                </AccordionTrigger>
                                            </div>
                                            <div className="text-sm font-medium mb-2">
                                                {extractionResult ? (
                                                    formatValue(extractedValue?.value, field.type)
                                                ) : (
                                                    <span className="text-muted-foreground italic">
                                                        No extraction run yet
                                                    </span>
                                                )}
                                            </div>
                                            <AccordionContent className="pt-2">
                                                <div className="space-y-4 border-t pt-4">
                                                    {isEditing ? (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <Label className="text-xs font-medium mb-1 block">
                                                                    Field Name
                                                                </Label>
                                                                <Input
                                                                    value={tempField?.name || field.name}
                                                                    onChange={(e) =>
                                                                        setTempField((prev) => ({
                                                                            ...field,
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
                                                                    value={tempField?.type || field.type}
                                                                    onValueChange={(value) =>
                                                                        setTempField((prev) => ({
                                                                            ...field,
                                                                            ...prev,
                                                                            type: value as any,
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
                                                                        <SelectItem value="currency">
                                                                            Currency
                                                                        </SelectItem>
                                                                        <SelectItem value="boolean">Boolean</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs font-medium mb-1 block">
                                                                    Description
                                                                </Label>
                                                                <Textarea
                                                                    value={tempField?.description || field.description}
                                                                    onChange={(e) =>
                                                                        setTempField((prev) => ({
                                                                            ...field,
                                                                            ...prev,
                                                                            description: e.target.value,
                                                                        }))
                                                                    }
                                                                    className="text-sm min-h-[60px]"
                                                                    placeholder="Describe what this field should extract..."
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (tempField && onFieldUpdate) {
                                                                            onFieldUpdate(index, tempField);
                                                                            // Trigger re-extraction after field update
                                                                            if (onExtractData) {
                                                                                onExtractData();
                                                                            }
                                                                        }
                                                                        setEditingField(null);
                                                                        setTempField(null);
                                                                    }}
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setEditingField(null);
                                                                        setTempField(null);
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <p className="text-xs text-muted-foreground">
                                                                {field.description}
                                                            </p>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingField(index);
                                                                    setTempField(field);
                                                                }}
                                                                className="h-8"
                                                            >
                                                                <Edit3 className="h-3 w-3 mr-1" />
                                                                Edit Field
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </div>
                                    </AccordionItem>
                                </Accordion>
                            );
                        })}

                        {fields.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">No fields configured</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Table Values */}
            {tables.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>Extracted Tables</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {tables.map((table, tableIndex) => {
                                const extractedTable = extractionResult?.tables?.find(
                                    (t) => t.tableName === table.name,
                                );
                                return (
                                    <div key={tableIndex} className="border rounded-lg p-4">
                                        <div className="mb-3">
                                            <h4 className="font-medium">{table.name}</h4>
                                            <p className="text-sm text-muted-foreground">{table.description}</p>
                                        </div>

                                        {extractionResult && extractedTable && extractedTable.rows.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border-collapse border border-gray-200">
                                                    <thead>
                                                        <tr className="bg-muted">
                                                            {table.columns.map((column, colIndex) => (
                                                                <th
                                                                    key={colIndex}
                                                                    className="border border-gray-200 px-3 py-2 text-left font-medium"
                                                                >
                                                                    {column.name}
                                                                    <Badge variant="outline" className="ml-1 text-xs">
                                                                        {column.type}
                                                                    </Badge>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {extractedTable.rows.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className="hover:bg-muted/50">
                                                                {table.columns.map((column, colIndex) => (
                                                                    <td
                                                                        key={colIndex}
                                                                        className="border border-gray-200 px-3 py-2"
                                                                    >
                                                                        {formatValue(
                                                                            row.values[column.name],
                                                                            column.type,
                                                                        )}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-muted-foreground">
                                                {extractionResult ? "No table data extracted" : "No extraction run yet"}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
