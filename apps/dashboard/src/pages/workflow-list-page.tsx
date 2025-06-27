import { useNavigate } from "@tanstack/react-router";
import {
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    FileText,
    MoreVertical,
    Play,
    Plus,
    Trash2,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkflowExecutions } from "@/hooks/useWorkflowExecutions";
import { useWorkflows } from "@/hooks/useWorkflows";

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
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Workflows</h1>
                    <p className="text-muted-foreground mt-2">Manage your document processing workflows</p>
                </div>
                <Button size="lg" className="gap-2" onClick={() => navigate({ to: "/workflows/new" })}>
                    <Plus className="h-5 w-5" />
                    Create New Workflow
                </Button>
            </div>

            {/* Workflows */}
            <div>
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
                                                                    to: `/workflows/${workflow.id}/configure`,
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
