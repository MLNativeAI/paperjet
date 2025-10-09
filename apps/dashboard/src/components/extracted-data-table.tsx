import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ExtractedDataTableProps {
  name: string;
  data: Array<{
    [columnName: string]: string | number | Date | null;
  }>;
}

export function ExtractedDataTable({ name, data }: ExtractedDataTableProps) {
  const formatCellValue = (value: string | number | Date | null) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">-</span>;
    }

    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (value instanceof Date) {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(value);
    }

    const stringValue = String(value);

    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/;
    if (dateRegex.test(stringValue)) {
      try {
        const date = new Date(stringValue);
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          ...(stringValue.includes("T")
            ? {
                hour: "2-digit",
                minute: "2-digit",
              }
            : {}),
        }).format(date);
      } catch {
        return stringValue;
      }
    }

    return stringValue;
  };

  if (!data || data.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium">{name}</h5>
          <Badge variant="outline" className="text-xs">
            Empty
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">No rows in this table</p>
      </div>
    );
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <h5 className="font-medium">{name}</h5>
        <Badge variant="outline" className="text-xs">
          {data.length} {data.length === 1 ? "row" : "rows"}
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="whitespace-nowrap">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: good enough
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column} className="whitespace-nowrap">
                    {formatCellValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
