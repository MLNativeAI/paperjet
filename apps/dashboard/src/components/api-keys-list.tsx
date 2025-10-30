import type { ApiKey } from "@paperjet/engine/types";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconKey,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateApiKeyDialog } from "@/components/create-api-key-dialog";
import { ApiKeyDisplayDialog } from "@/components/api-key-display-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRevokeApiKey } from "@/hooks/use-api-keys";
import { formatDate } from "@/lib/utils/date";

interface ApiKeysListProps {
  apiKeys: ApiKey[];
  onRefresh: () => void;
}

export function ApiKeysList({ apiKeys, onRefresh }: ApiKeysListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [displayDialogOpen, setDisplayDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const { mutate: revokeApiKey, isPending: isRevoking } = useRevokeApiKey();

  const handleDelete = () => {
    if (!keyToDelete) return;

    revokeApiKey(keyToDelete.id, {
      onSuccess: () => {
        toast.success("API key revoked successfully");
        setDeleteDialogOpen(false);
        setKeyToDelete(null);
        onRefresh();
      },
      onError: () => {
        toast.error("Failed to revoke API key");
      },
    });
  };

  const handleKeyCreated = (apiKey: string) => {
    setNewApiKey(apiKey);
    setDisplayDialogOpen(true);
  };

  const handleDisplayDialogClose = () => {
    setDisplayDialogOpen(false);
    setNewApiKey(null);
    onRefresh();
  };

  const columns: ColumnDef<ApiKey>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "key",
      header: "API Key",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{row.original.key}</code>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: "lastUsedAt",
      header: "Last Used",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.lastRequest ? formatDate(row.original.lastRequest) : "Never"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.enabled ? "default" : "secondary"}
          className={row.original.enabled ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
        >
          {row.original.enabled ? "Active" : "Revoked"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
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
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setKeyToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
              disabled={!row.original.enabled}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Revoke
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: apiKeys,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (apiKeys.length === 0) {
    return (
      <>
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <IconKey className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No API Keys</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first API key to start using the PaperJet API
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </div>
        </Card>

        <CreateApiKeyDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleKeyCreated} />
        <ApiKeyDisplayDialog open={displayDialogOpen} onOpenChange={handleDisplayDialogClose} apiKey={newApiKey} />
      </>
    );
  }

  return (
    <>
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {apiKeys.length} active {apiKeys.length === 1 ? "key" : "keys"}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>

        <div className="w-full">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
          {apiKeys.length > 10 && (
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                selected.
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label htmlFor="rows-per-page" className="text-sm font-medium">
                    Rows per page
                  </Label>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value));
                    }}
                  >
                    <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                      <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    <IconChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    <IconChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the API key "{keyToDelete?.name}"? This action cannot be undone and any
              applications using this key will stop working immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isRevoking}>
              {isRevoking ? "Revoking..." : "Revoke Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create API Key Dialog */}
      <CreateApiKeyDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleKeyCreated} />
      <ApiKeyDisplayDialog open={displayDialogOpen} onOpenChange={handleDisplayDialogClose} apiKey={newApiKey} />
    </>
  );
}
