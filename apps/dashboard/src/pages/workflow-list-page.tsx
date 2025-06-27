import { useNavigate } from "@tanstack/react-router";
import {
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    DollarSign,
    Edit,
    Eye,
    FileSpreadsheet,
    FileText,
    MoreVertical,
    Package,
    Play,
    Plus,
    Receipt,
    ScrollText,
    Trash2,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWorkflowExecutions } from "@/hooks/useWorkflowExecutions";
import { useWorkflows } from "@/hooks/useWorkflows";

const workflowTemplates = [
    {
        id: "invoice",
        name: "Invoice Processing",
        description: "Extract vendor, amounts, line items, and payment details from invoices",
        icon: FileText,
        color: "text-blue-600",
    },
    {
        id: "receipt",
        name: "Receipt Scanning",
        description: "Capture merchant, date, total, and itemized purchases from receipts",
        icon: Receipt,
        color: "text-green-600",
    },
    {
        id: "purchase-order",
        name: "Purchase Orders",
        description: "Extract PO numbers, items, quantities, and delivery information",
        icon: Package,
        color: "text-purple-600",
    },
    {
        id: "bank-statement",
        name: "Bank Statements",
        description: "Process transactions, balances, and account details from statements",
        icon: DollarSign,
        color: "text-orange-600",
    },
    {
        id: "contract",
        name: "Contracts & Agreements",
        description: "Extract parties, terms, dates, and key clauses from legal documents",
        icon: ScrollText,
        color: "text-red-600",
    },
    {
        id: "tax-form",
        name: "Tax Forms",
        description: "Process W-2s, 1099s, and other tax documents for key data points",
        icon: FileSpreadsheet,
        color: "text-indigo-600",
    },
];

export default function WorkflowListPage() {
    const navigate = useNavigate();
    const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());

    const { workflows, isLoading, handleDeleteWorkflow } = useWorkflows();

    const toggleWorkflowExpansion = (workflowId: string) => {
        setExpandedWorkflows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(workflowId)) {
                newSet.delete(workflowId);
            } else {
                newSet.add(workflowId);
            }
            return newSet;
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="h-4 w-4 text-muted-foreground" />;
            case "processing":
                return (
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                );
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "failed":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getStatusColor = (status: string) => {
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

    // Component to render execution history for a workflow
    const WorkflowExecutions = ({ workflowId }: { workflowId: string }) => {
        const { data: executions = [], isLoading } = useWorkflowExecutions(
            workflowId,
            expandedWorkflows.has(workflowId),
        );

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
            <div className="w-full p-4 bg-muted/20">
                <h4 className="font-medium mb-3 text-sm">Recent Executions</h4>
                <div className="w-full space-y-2">
                    {executions.slice(0, 5).map((execution: any) => (
                        <div
                            key={execution.id}
                            className="w-full flex items-center justify-between p-2 bg-background rounded border"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                {getStatusIcon(execution.status)}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {new Date(execution.startedAt).toLocaleDateString()}
                                        </span>
                                        <Badge variant={getStatusColor(execution.status) as any} className="text-xs">
                                            {execution.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {execution.files?.length || 0} files processed
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => navigate({ to: `/executions/${execution.id}` })}
                                >
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {executions.length > 5 && (
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
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-8">What would you like to process today?</h1>
                <Button size="lg" className="gap-2" onClick={() => navigate({ to: "/workflows/new" })}>
                    <Plus className="h-5 w-5" />
                    Create New Workflow
                </Button>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Choose from a template</h2>
                    <p className="text-muted-foreground mb-6">
                        Start with a pre-built workflow for common document types
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workflowTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <Card
                                key={template.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                            >
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg bg-gray-50 ${template.color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                            <CardDescription className="mt-1">{template.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* My Workflows Section */}
            <div className="space-y-6 mt-16">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">My Workflows</h2>
                    <p className="text-muted-foreground mb-6">Manage your existing document processing workflows</p>
                </div>

                {isLoading ? (
                    <Card>
                        <div className="p-8">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="ml-2 text-muted-foreground">Loading workflows...</span>
                            </div>
                        </div>
                    </Card>
                ) : workflows.length === 0 ? (
                    <Card>
                        <div className="p-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
                            <p className="text-muted-foreground mb-4">
                                You haven't created any workflows yet. Start by creating your first workflow using one
                                of the templates above.
                            </p>
                            <Button onClick={() => navigate({ to: "/workflows/new" })}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Workflow
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <div className="divide-y">
                            {workflows.map((workflow) => {
                                const config = workflow.configuration;
                                const fieldCount = config.fields?.length || 0;
                                const tableCount = config.tables?.length || 0;
                                const isExpanded = expandedWorkflows.has(workflow.id);

                                return (
                                    <Collapsible
                                        key={workflow.id}
                                        open={isExpanded}
                                        onOpenChange={() => toggleWorkflowExpansion(workflow.id)}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>

                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                                        <div className="font-medium">{workflow.name}</div>
                                                        <div className="text-muted-foreground text-sm">
                                                            {fieldCount} fields
                                                            {tableCount > 0 && `, ${tableCount} tables`}
                                                        </div>
                                                        <div className="text-muted-foreground text-sm">
                                                            <div className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-2" />
                                                                {new Date(workflow.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                navigate({
                                                                    to: `/workflows/${workflow.id}/run`,
                                                                })
                                                            }
                                                        >
                                                            <Play className="h-4 w-4 mr-2" />
                                                            Run Workflow
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                navigate({
                                                                    to: `/workflows/${workflow.id}/history`,
                                                                })
                                                            }
                                                        >
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            View History
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                navigate({
                                                                    to: `/workflows/${workflow.id}/edit`,
                                                                })
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteWorkflow(workflow.id, workflow.name)
                                                            }
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <CollapsibleContent>
                                            <div className="border-t">
                                                <WorkflowExecutions workflowId={workflow.id} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                );
                            })}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
