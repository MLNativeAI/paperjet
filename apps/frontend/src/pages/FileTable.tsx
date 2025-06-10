import * as React from "react";
import {
  IconArrowsUpDown,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type FileDataWithPresignedUrl } from "@backend/db/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteFilesMutation, getAllFilesQueryOptions } from "@/lib/api";

export function FileTable() {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<
    VisibilityState
  >({});

  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery(getAllFilesQueryOptions);
  const hasSelectedRows = Object.keys(rowSelection).length > 0;

  // Add mutation for deleting files
  const deleteMutation = useMutation({
    mutationFn: deleteFilesMutation,
    onSuccess: () => {
      console.log("Delete success, invalidating files");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setRowSelection({});
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const handleDeleteSelected = async () => {
    if (!hasSelectedRows || !data) return;

    const selectedRowIds = Object.keys(rowSelection);
    const selectedFileIds = selectedRowIds
      .map((rowId) => {
        const fileData = data.find((file: FileDataWithPresignedUrl) =>
          file.id.toString() === rowId
        );
        return fileData?.id;
      })
      .filter((id): id is string => id !== undefined);

    console.log("Deleting file IDs:", selectedFileIds);

    deleteMutation.mutate(selectedFileIds);
  };

  // Define columns inside the component to have access to the mutation
  const columns = React.useMemo<ColumnDef<FileDataWithPresignedUrl>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)}
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
      {
        accessorKey: "filename",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Filename
              <IconArrowsUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.original.filename}</div>,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Created At
              <IconArrowsUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => row.original.createdAt,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const file = row.original;

          return (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(file.presignedUrl, "_blank")}
              >
                <IconDownload className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => {
                  if (
                    confirm(`Are you sure you want to delete ${file.filename}?`)
                  ) {
                    deleteMutation.mutate([file.id]);
                  }
                }}
              >
                <IconTrash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [deleteMutation],
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="w-full px-4 lg:px-6">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter files..."
          value={(table.getColumn("filename")?.getFilterValue() as string) ??
            ""}
          onChange={(event) =>
            table.getColumn("filename")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Actions <IconChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={handleDeleteSelected}
              disabled={!hasSelectedRows}
              className={!hasSelectedRows
                ? "text-muted-foreground"
                : "text-destructive"}
            >
              Delete Selected
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)}
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
                      {header.isPlaceholder ? null : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending
              ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent">
                      </div>
                      <span className="ml-2">Loading files...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )
              : error
              ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-destructive"
                  >
                    Error loading files:{" "}
                    {error instanceof Error ? error.message : "Unknown error"}
                  </TableCell>
                </TableRow>
              )
              : table.getRowModel().rows?.length
              ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
              : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No files found.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} file(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <IconChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
