import type { TableConfiguration } from "@paperjet/engine/types";
import { isTableOutdated } from "@paperjet/engine/utils/outdated-check";
import { AlertCircle, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WorkflowTableCardProps {
  table: TableConfiguration[number];
  sampleData: TableSampleData | null;
  sampleDataExtractedAt?: Date | null;
  onEdit: (table: TableConfiguration[number]) => void;
}

export default function WorkflowTableCard({
  table,
  sampleData,
  sampleDataExtractedAt,
  onEdit,
}: WorkflowTableCardProps) {
  const rowCount = sampleData?.rows.length || 0;
  const columnCount = table.columns.length;
  const isOutdated = isTableOutdated(table, sampleDataExtractedAt);

  return (
    <Card className={cn(isOutdated && "opacity-50")}>
      <CardHeader>
        <CardTitle className="text-md">{table.name}</CardTitle>
        <CardDescription>
          {rowCount} rows × {columnCount} columns
        </CardDescription>
        <CardAction>
          <Button variant="link" onClick={() => onEdit(table)}>
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {/* Sample Data Preview */}
        {sampleData && sampleData.rows.length > 0 ? (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {table.columns.map((col) => (
                      <th key={col.name} className="text-left font-medium px-2 py-1.5 text-xs text-muted-foreground">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleData.rows.slice(0, 3).map((row, idx) => (
                    <tr key={`${table.name}-row-${idx}`} className="border-b last:border-0">
                      {table.columns.map((col) => (
                        <td key={col.name} className="px-2 py-1.5">
                          {String(row.values[col.name] || "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rowCount > 3 && <p className="text-xs text-muted-foreground text-center">+{rowCount - 3} more rows</p>}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No sample data available</p>
        )}

        {/* Table Type Badge */}
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary" className="h-5 text-xs">
            <Table2 className="h-3 w-3 mr-1" />
            Table
          </Badge>
          {isOutdated && (
            <Badge variant="destructive" className="h-5 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Outdated
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
