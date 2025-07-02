import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconDotsVertical,
    IconDownload,
    IconEye,
    IconTrash,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { Calendar, CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

interface RunData {
    id: string;
    workflowName: string;
    filename: string | null;
    status: ExecutionStatus;
    startedAt: string;
    completedAt: string | null;
    errorMessage?: string;
    extractionResult?: any;
}

interface RunsDataTableProps {
    data: RunData[];
    onExportRun: (run: RunData) => void;
    onDeleteRun: (run: RunData) => void;
    formatDuration: (startedAt: string, completedAt: string | null) => string;
}

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case "pending":
            return <Clock className="h-4 w-4 text-muted-foreground" />;
        case "processing":
            return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
        case "completed":
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case "failed":
            return <XCircle className="h-4 w-4 text-red-600" />;
    }
};

const getStatusColor = (status: ExecutionStatus): "secondary" | "default" | "destructive" => {
    switch (status) {
        case "pending":
            return "secondary";
        case "processing":
            return "default";
        case "completed":
            return "default";
        case "failed":
            return "destructive";
    }
};

export function RunsDataTable({ data, onExportRun, onDeleteRun, formatDuration }: RunsDataTableProps) {
    const navigate = useNavigate();
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const columns: ColumnDef<RunData>[] = [
        {
            accessorKey: "workflowName",
            header: "Workflow Name",
            cell: ({ row }) => <div className="font-medium">{row.original.workflowName}</div>,
            enableHiding: false,
        },
        {
            accessorKey: "filename",
            header: "File Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.filename || "N/A"}</span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {getStatusIcon(row.original.status)}
                    <Badge variant={getStatusColor(row.original.status)}>{row.original.status}</Badge>
                </div>
            ),
        },
        {
            accessorKey: "startedAt",
            header: "Started At",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(row.original.startedAt).toLocaleString()}
                </div>
            ),
        },
        {
            accessorKey: "duration",
            header: "Duration",
            cell: ({ row }) => <div className="text-sm">{formatDuration(row.original.startedAt, row.original.completedAt)}</div>,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate({ to: `/executions/${row.original.id}` })}>
                        <IconEye className="h-4 w-4 mr-2" />
                        View
                    </Button>
                    {row.original.status === "completed" && row.original.extractionResult && (
                        <Button variant="outline" size="sm" onClick={() => onExportRun(row.original)}>
                            <IconDownload className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
                                <IconDotsVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => navigate({ to: `/executions/${row.original.id}` })}>
                                <IconEye className="h-4 w-4 mr-2" />
                                View Details
                            </DropdownMenuItem>
                            {row.original.status === "completed" && row.original.extractionResult && (
                                <DropdownMenuItem onClick={() => onExportRun(row.original)}>
                                    <IconDownload className="h-4 w-4 mr-2" />
                                    Download Result
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => onDeleteRun(row.original)}>
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
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
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
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
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
                        <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
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
        </div>
    );
}
