import { Table, flexRender } from "@tanstack/react-table";
import { TableBody, TableRow, TableCell } from "./ui/table";
import { columns } from "./usage-table/all-usage-table";
import { UsageData } from "@paperjet/engine/types";
import { Skeleton } from "./ui/skeleton";

export function TableBodyWithSkeleton({ isLoading, table }: { isLoading: boolean, table: Table<UsageData> }) {

  if (isLoading) {
    return (
      <TableBody>
        {[...Array(5).keys()].map((_, index) => {
          return (
            <TableRow
              key={index}
            >
              {table.getAllColumns().map((_, colId) => {
                return (
                  <TableCell key={colId}>
                    <Skeleton className="h-[20px] w-full opacity-25" />
                  </TableCell>
                )
              })}
              <td key={index} className="p-2">
              </td>
            </TableRow>
          )
        })}
      </TableBody>
    )
  }

  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>)
}
