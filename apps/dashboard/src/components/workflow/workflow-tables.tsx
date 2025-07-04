import type { Workflow } from "@paperjet/engine/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryGroup } from "./workflow-categories";

export default function WorkflowTables({ category, workflow }: { category: CategoryGroup; workflow: Workflow }) {
    // Get sample data for tables
    const getTableSampleData = (tableName: string) => {
        if (!workflow.sampleData?.tables) return null;
        const sampleTable = workflow.sampleData.tables.find((t) => t.tableName === tableName);
        return sampleTable;
    };

    return (
        category.tables.length > 0 && (
            <div className="space-y-3">
                <h4 className="text-md font-medium">Tables</h4>
                <div className="space-y-4">
                    {category.tables.map((table) => {
                        const sampleData = getTableSampleData(table.name);
                        return (
                            <Card key={table.name}>
                                <CardHeader>
                                    <CardTitle className="text-md">{table.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Sample Data */}
                                    {sampleData && sampleData.rows.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        {table.columns.map((col) => (
                                                            <th key={col.name} className="text-left font-medium px-2 py-1">
                                                                {col.name}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sampleData.rows.slice(0, 3).map((row, idx) => (
                                                        <tr key={idx} className="border-b">
                                                            {table.columns.map((col) => (
                                                                <td key={col.name} className="px-2 py-1">
                                                                    {String(row.values[col.name] || "-")}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No sample data available</p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        )
    );
}
