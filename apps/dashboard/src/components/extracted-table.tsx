import type { ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { Badge } from "@/components/ui/badge";

interface ExtractedTableProps {
  table: ExtractionTable;
  tableIndex: number;
  extractionResult: ExtractionResult | null;
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

export function ExtractedTable({ table, tableIndex, extractionResult }: ExtractedTableProps) {
  const extractedTable = extractionResult?.tables?.find((t) => t.tableName === table.name);

  return (
    <div key={`table-${table.name}-${tableIndex}`} className="border rounded-lg p-4">
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
                  <th key={colIndex} className="border border-gray-200 px-3 py-2 text-left font-medium">
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
                    <td key={colIndex} className="border border-gray-200 px-3 py-2">
                      {formatValue(row.values[column.name], column.type)}
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
}
