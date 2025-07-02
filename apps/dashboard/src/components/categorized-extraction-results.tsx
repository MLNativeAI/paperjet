import type { ExtractedTable, ExtractedValue, ExtractionResult } from "@paperjet/db/types";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CategorizedExtractionResultsProps {
    extractionResult: ExtractionResult | null;
}

export function CategorizedExtractionResults({ extractionResult }: CategorizedExtractionResultsProps) {
    const formatValue = (value: string | number | boolean | Date | null, type: string) => {
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

    if (!extractionResult) {
        return (
            <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No extraction results available</p>
                </div>
            </div>
        );
    }

    // Group fields by category (assuming we have category info in field names or we'll need to fetch workflow config)
    const fieldsByCategory =
        extractionResult.fields?.reduce(
            (acc, field) => {
                // For now, we'll use a simple heuristic or default category
                // In a real implementation, we'd need the workflow configuration to get categories
                const category = "Extracted Data"; // Default category
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(field);
                return acc;
            },
            {} as Record<string, ExtractedValue[]>,
        ) || {};

    const categories = Object.keys(fieldsByCategory);

    return (
        <div className="space-y-6">
            {/* Fields Grid */}
            {categories.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {categories.map((categoryName) => (
                        <Card key={categoryName}>
                            <CardHeader>
                                <CardTitle className="text-base">{categoryName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {fieldsByCategory[categoryName].map((field: ExtractedValue, fieldIndex: number) => (
                                        <div
                                            key={`field-${field.fieldName}-${fieldIndex}`}
                                            className="border-l-4 border-l-blue-500 bg-muted/50 rounded p-3"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{field.fieldName}</span>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {formatValue(field.value, "text")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Tables */}
            {extractionResult.tables && extractionResult.tables.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {extractionResult.tables.map((table: ExtractedTable, tableIndex: number) => (
                                <div key={`table-${table.tableName}-${tableIndex}`} className="space-y-2">
                                    <h4 className="font-medium">{table.tableName}</h4>
                                    {table.rows && table.rows.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {Object.keys(table.rows[0].values).map(
                                                            (columnName: string, colIndex: number) => (
                                                                <TableHead key={colIndex}>{columnName}</TableHead>
                                                            ),
                                                        )}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {table.rows.map((row: any, rowIndex: number) => (
                                                        <TableRow key={`row-${tableIndex}-${rowIndex}`}>
                                                            {Object.values(row.values).map(
                                                                (value: any, colIndex: number) => (
                                                                    <TableCell
                                                                        key={`col-${tableIndex}-${rowIndex}-${colIndex}`}
                                                                    >
                                                                        {formatValue(value, "text")}
                                                                    </TableCell>
                                                                ),
                                                            )}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No table data found</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {(!extractionResult.fields || extractionResult.fields.length === 0) &&
                (!extractionResult.tables || extractionResult.tables.length === 0) && (
                    <div className="h-48 flex items-center justify-center">
                        <div className="text-center">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No data extracted</p>
                        </div>
                    </div>
                )}
        </div>
    );
}
