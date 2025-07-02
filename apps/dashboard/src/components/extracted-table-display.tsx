import type { ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExtractedTableDisplayProps {
    tables: ExtractionTable[];
    extractionResult: ExtractionResult | null;
}

const formatValue = (value: unknown, type: string): React.ReactNode => {
    if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic">No data found</span>;
    }

    switch (type) {
        case "currency":
            return typeof value === "number" ? `$${value.toFixed(2)}` : String(value);
        case "date":
            return String(value);
        case "boolean":
            return value ? "Yes" : "No";
        default:
            return String(value);
    }
};

export function ExtractedTableDisplay({ tables, extractionResult }: ExtractedTableDisplayProps) {
    if (tables.length === 0 || !extractionResult) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Extracted Tables</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {tables.map((table) => {
                        const extractedTable = extractionResult.tables.find((t) => t.tableName === table.name);
                        return (
                            <div key={table.name} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-medium">{table.name}</h4>
                                        <p className="text-sm text-muted-foreground">{table.description}</p>
                                    </div>
                                </div>

                                {extractedTable && extractedTable.rows.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse border border-gray-200">
                                            <thead>
                                                <tr className="bg-muted">
                                                    {table.columns.map((column) => (
                                                        <th key={column.name} className="border border-gray-200 px-3 py-2 text-left font-medium">
                                                            {column.name}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {extractedTable.rows.map((row, rowIndex) => (
                                                    <tr key={`row-${rowIndex}-${table.name}`} className="hover:bg-muted/50">
                                                        {table.columns.map((column, colIndex) => (
                                                            <td
                                                                key={`${table.name}-${column.name}-${rowIndex}-${colIndex}`}
                                                                className="border border-gray-200 px-3 py-2"
                                                            >
                                                                {formatValue(row.values[column.name], column.type)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">No table data extracted</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
