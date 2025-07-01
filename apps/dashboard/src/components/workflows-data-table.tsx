import type { WorkflowExecutionWithFiles } from "@paperjet/db/types";
import {
    IconAccessPoint,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconDotsVertical,
    IconEdit,
    IconHistory,
    IconTrash,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { Calendar, CheckCircle, ChevronDown, ChevronRight, Clock, Eye, XCircle, PlayIcon } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWorkflowExecutions } from "@/hooks/useWorkflowExecutions";

interface WorkflowData {
    id: string;
    name: string;
    description?: string | null;
    configuration: {
        fields?: any[];
        tables?: any[];
    };
    createdAt: string;
    updatedAt: string;
}

interface WorkflowsDataTableProps {
    data: WorkflowData[];
    onDeleteWorkflow: (workflowId: string, workflowName: string) => void;
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case "pending":
            return <Clock className="h-4 w-4 text-muted-foreground" />;
        case "processing":
            return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
        case "completed":
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case "failed":
            return <XCircle className="h-4 w-4 text-red-600" />;
        default:
            return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
};

const getStatusColor = (status: string): "secondary" | "default" | "destructive" => {
    switch (status) {
        case "pending":
            return "secondary";
        case "processing":
            return "default";
        case "completed":
            return "default";
        case "failed":
            return "destructive";
        default:
            return "secondary";
    }
};

function WorkflowExecutionRow({ workflowId }: { workflowId: string }) {
    const { data: executions = [], isLoading } = useWorkflowExecutions(workflowId, true);
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading executions...</span>
            </div>
        );
    }

    if (executions.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                No executions yet. Run this workflow to see execution history.
            </div>
        );
    }

    return (
        <div className="p-4 bg-muted/20">
            <h4 className="font-medium mb-3 text-sm">Recent Executions</h4>
            <div className="space-y-2">
                {executions.slice(0, 3).map((execution) => (
                    <div
                        key={execution.id}
                        className="flex items-center justify-between p-2 bg-background rounded border"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(execution.status)}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {new Date(execution.startedAt).toLocaleDateString()}
                                    </span>
                                    <Badge variant={getStatusColor(execution.status)} className="text-xs">
                                        {execution.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {execution.filename || "No filename"}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => navigate({ to: `/executions/${execution.id}` })}
                        >
                            <Eye className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
                {executions.length > 3 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => navigate({ to: `/workflows/${workflowId}/history` })}
                    >
                        View all {executions.length} executions
                    </Button>
                )}
            </div>
        </div>
    );
}

export function WorkflowsDataTable({ data, onDeleteWorkflow }: WorkflowsDataTableProps) {
    const navigate = useNavigate();
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const columns: ColumnDef<WorkflowData>[] = [
        {
            id: "expander",
            header: () => null,
            cell: ({ row }) => {
                return (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => row.toggleExpanded()}>
                        {row.getIsExpanded() ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                );
            },
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Workflow Name",
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
            enableHiding: false,
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground max-w-xs truncate">
                    {row.original.description || "No description"}
                </div>
            ),
        },
        {
            accessorKey: "configuration",
            header: "Fields",
            cell: ({ row }) => {
                const config = row.original.configuration;
                const fieldCount = config.fields?.length || 0;
                const tableCount = config.tables?.length || 0;
                return (
                    <div className="text-sm">
                        {fieldCount} fields
                        {tableCount > 0 && `, ${tableCount} tables`}
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: `/workflows/${row.original.id}/run` })}
                    >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Run
                    </Button>
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
                            <DropdownMenuItem onClick={() => navigate({ to: `/workflows/${row.original.id}/history` })}>
                                <IconHistory className="h-4 w-4 mr-2" />
                                View History
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigate({ to: `/workflows/${row.original.id}/configure` })}
                            >
                                <IconEdit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDeleteWorkflow(row.original.id, row.original.name)}
                            >
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
            expanded,
            pagination,
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        enableExpanding: true,
        getRowCanExpand: () => true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onExpandedChange: setExpanded,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
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
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-muted/50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="p-0">
                                                <WorkflowExecutionRow workflowId={row.original.id} />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
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
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{" "}
                    row(s) selected.
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
        </div>
    );
}
