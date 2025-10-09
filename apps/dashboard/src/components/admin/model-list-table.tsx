import type { DbModelConfiguration } from "@paperjet/db/types";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { EditModelDialog } from "@/components/admin/edit-model-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useModelConfiguration } from "@/hooks/use-model-configuration";

export function ModelListTable({ data }: { data: DbModelConfiguration[] }) {
  const { deleteModel } = useModelConfiguration();

  function onDeleteModelConfiguration(modelConfig: DbModelConfiguration) {
    if (confirm(`Are you sure you want to delete the model "${modelConfig.displayName}"?`)) {
      deleteModel.mutate(modelConfig.id, {
        onSuccess: () => {
          toast.success("Model configuration deleted successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete model configuration");
        },
      });
    }
  }

  const columns: ColumnDef<DbModelConfiguration>[] = [
    {
      accessorKey: "displayName",
      header: "Display Name",
      cell: ({ row }) => <div className="font-medium">{row.original.displayName}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }) => <div className="font-medium">{row.original.provider}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "modelName",
      header: "Model",
      cell: ({ row }) => <div className="font-medium">{row.original.modelName}</div>,
      enableHiding: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <EditModelDialog model={row.original} />
              <DropdownMenuItem onClick={() => onDeleteModelConfiguration(row.original)} className="text-destructive">
                <IconTrash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
      </div>
    </div>
  );
}
