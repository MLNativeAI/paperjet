import { formatDistance } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";

export const renderMonetaryValue = (value: number, precision: number = 2): string => {
  return `$${value.toFixed(precision)}`;
};

export const renderTokenCount = (tokenCount: number): string => {
  return `${(tokenCount / 1000).toFixed(2)}k`;
};

export const renderDuration = (duration: number): string => {
  return `${(duration / 1000).toFixed(2)}s`;
};

const renderTimestamp = (date: Date): string => {
  return formatDistance(date, new Date(), { addSuffix: true });
};

type ColumnType = "text" | "monetary" | "token" | "duration" | "timestamp";

export const getColumn = ({
  identifier,
  label,
  sortable,
  columnType,
}: {
  identifier: string;
  label: string;
  sortable?: boolean;
  columnType?: ColumnType;
}) => {
  return {
    accessorKey: identifier,
    header: ({ column }: { column: any }) => {
      if (sortable) {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {label}
            <ArrowUpDown />
          </Button>
        );
      } else {
        return <div>{label}</div>;
      }
    },
    cell: ({ row }: { row: any }) => {
      switch (columnType) {
        case "text":
          return <div>{row.getValue(identifier)}</div>;
        case "monetary":
          return <div> {renderMonetaryValue(row.getValue(identifier), 4)}</div>;
        case "token":
          return <div> {renderTokenCount(row.getValue(identifier))}</div>;
        case "duration":
          return <div>{renderDuration(row.getValue(identifier))}</div>;
        case "timestamp":
          return <div>{renderTimestamp(row.getValue(identifier))}</div>;
        default:
          return <div>{row.getValue(identifier)}</div>;
      }
    },
  };
};
