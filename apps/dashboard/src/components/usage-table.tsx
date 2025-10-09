import type { UsageData } from "@paperjet/engine/types";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getColumn } from "./format-utils";
import { TableBodyWithSkeleton } from "./table-body-with-skeleton";
import { UserFilterComboBox } from "./usage-table/user-filter-combo-box";
import { WorkflowFilterComboBox } from "./usage-table/workflow-filter-combo-box";

export const columns: ColumnDef<UsageData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  getColumn({
    identifier: "id",
    label: "ID",
  }),
  getColumn({
    identifier: "name",
    label: "Prompt name",
  }),
  getColumn({
    identifier: "model",
    label: "Model name",
  }),
  getColumn({
    identifier: "userId",
    label: "User ID",
  }),
  getColumn({
    identifier: "userEmail",
    label: "User email",
    sortable: false,
  }),
  getColumn({
    identifier: "workflowId",
    label: "Workflow",
    sortable: false,
  }),
  getColumn({
    identifier: "executionId",
    label: "Execution ID",
    sortable: false,
  }),
  getColumn({
    identifier: "totalTokens",
    label: "Total tokens",
    columnType: "token",
  }),
  getColumn({
    identifier: "totalCost",
    label: "Cost",
    columnType: "monetary",
  }),
  getColumn({ identifier: "durationMs", label: "Duration", columnType: "duration" }),
  getColumn({ identifier: "createdAt", label: "Created at", columnType: "timestamp" }),
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function UsageTable({ usageData, isLoading }: { usageData: UsageData[]; isLoading: boolean }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    id: false,
    userId: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});

  const filters = [
    {
      name: "None",
      component: null,
    },
    {
      name: "User",
      component: (
        <UserFilterComboBox
          usageData={usageData}
          updateFilter={(email: string) => {
            table.getColumn("userEmail")?.setFilterValue(email);
          }}
        />
      ),
    },
    {
      name: "Workflow",
      component: (
        <WorkflowFilterComboBox
          usageData={usageData}
          updateFilter={(workflowId: string) => {
            table.getColumn("workflowId")?.setFilterValue(workflowId);
          }}
        />
      ),
    },
  ];

  const [selectedFilter, selectFilter] = React.useState(filters[0]);

  const table = useReactTable({
    data: usageData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex gap-2 items-center">
          <span className="text-muted-foreground text-sm">Filter by</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={cn("ml-auto", selectedFilter.name === "None" && "opacity-75")}>
                {selectedFilter.name} <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {filters.map((filter) => {
                return (
                  <DropdownMenuItem
                    key={filter.name}
                    onClick={(_) => {
                      selectFilter(filter);
                      table.resetColumnFilters();
                    }}
                  >
                    {filter.name}
                  </DropdownMenuItem>
                );
              })}
              {/* {table */}
              {/*   .getAllColumns() */}
              {/*   .filter((column) => column.getCanHide()) */}
              {/*   .map((column) => { */}
              {/*     return ( */}
              {/*       <DropdownMenuCheckboxItem */}
              {/*         key={column.id} */}
              {/*         className="capitalize" */}
              {/*         checked={column.getIsVisible()} */}
              {/*         onCheckedChange={(value) => */}
              {/*           column.toggleVisibility(!!value) */}
              {/*         } */}
              {/*       > */}
              {/*         {column.id} */}
              {/*       </DropdownMenuCheckboxItem> */}
              {/*     ) */}
              {/*   })} */}
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedFilter.component}
        </div>
        {/* <Input */}
        {/*   placeholder="Filter emails..." */}
        {/*   value={(table.getColumn("email")?.getFilterValue() as string) ?? ""} */}
        {/*   onChange={(event) => */}
        {/*     table.getColumn("email")?.setFilterValue(event.target.value) */}
        {/*   } */}
        {/*   className="max-w-sm" */}
        {/* /> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBodyWithSkeleton isLoading={isLoading} table={table} />
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
