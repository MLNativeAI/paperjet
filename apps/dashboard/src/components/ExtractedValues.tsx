import type { ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ExtractedValuesProps {
    extractionResult: ExtractionResult | null;
    fields: ExtractionField[];
    tables: ExtractionTable[];
    isLoading?: boolean;
}

export function ExtractedValues({ extractionResult, fields, tables, isLoading = false }: ExtractedValuesProps) {
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
                    <CardTitle>Extracted Values</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Extracting data...</p>
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
                            const extractedValue = extractionResult?.fields.find((f) => f.fieldName === field.name);
                            return (
                                <div key={index} className="border-l-4 border-l-blue-500 bg-muted/50 rounded p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Label className="font-medium text-sm">{field.name}</Label>
                                        <Badge variant="outline" className="text-xs">
                                            {field.type}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {extractionResult ? (
                                            formatValue(extractedValue?.value, field.type)
                                        ) : (
                                            <span className="text-muted-foreground italic">No extraction run yet</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                                </div>
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
                            {isOutdated && (
                                <Badge variant="secondary" className="text-orange-600 bg-orange-100">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Outdated
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {tables.map((table, tableIndex) => {
                                const extractedTable = extractionResult?.tables.find((t) => t.tableName === table.name);
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
