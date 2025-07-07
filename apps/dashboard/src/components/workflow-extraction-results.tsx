import type { ExtractedTable, ExtractedValue, ExtractionResult } from "@paperjet/db/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WorkflowExtractionResultsProps {
  result: ExtractionResult;
}

export function WorkflowExtractionResults({ result }: WorkflowExtractionResultsProps) {
  if (!result) return null;

  try {
    const { fields = [], tables = [] } = result;

    return (
      <div className="space-y-4">
        {/* Fields */}
        {fields.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Extracted Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map((field: ExtractedValue, index: number) => (
                <div key={`field-${field.fieldName}-${index}`} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">{field.fieldName}</span>
                  </div>
                  <div className="text-sm">
                    {field.value !== null && field.value !== undefined ? (
                      <span className="font-medium">{String(field.value)}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Not found</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tables */}
        {tables.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Extracted Tables</h4>
            <div className="space-y-4">
              {tables.map((table: ExtractedTable, tableIndex: number) => (
                <div key={`table-${table.tableName || `table-${tableIndex}`}`} className="border rounded-lg">
                  <div className="p-3 border-b bg-muted/50">
                    <h5 className="font-medium">{table.tableName}</h5>
                    <p className="text-sm text-muted-foreground">{table.rows?.length || 0} rows</p>
                  </div>
                  {table.rows && table.rows.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(table.rows[0].values || table.rows[0]).map((key: string) => (
                              <TableHead key={key} className="text-xs">
                                {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.rows.map(
                            (
                              row: {
                                values?: Record<string, string | number | boolean | Date | null>;
                              },
                              rowIndex: number,
                            ) => (
                              <TableRow key={`row-${tableIndex}-${rowIndex}`}>
                                {Object.entries(row.values || row).map(
                                  ([key, value]: [string, string | number | boolean | Date | null]) => (
                                    <TableCell key={key} className="text-xs">
                                      {value !== null && value !== undefined ? String(value) : "-"}
                                    </TableCell>
                                  ),
                                )}
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="p-3 text-sm text-red-600 bg-red-50 rounded">
        Error parsing results: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}
