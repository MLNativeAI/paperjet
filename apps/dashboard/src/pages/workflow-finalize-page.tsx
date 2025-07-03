import { useParams } from "@tanstack/react-router";
import BasicWorkflowDataForm from "@/components/workflow/basic-workflow-data-form";
import WorkflowFields from "@/components/workflow/workflow-fields";
import { useWorkflow } from "@/hooks/useWorkflow";

export default function WorkflowFinalizePage() {
    const { workflowId } = useParams({
        from: "/_app/workflows/$workflowId/finalize",
    });

    const { workflow } = useWorkflow(workflowId);

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Finalize Workflow</h1>
                    <p className="text-muted-foreground mt-2">Review, customize and save your workflow</p>
                </div>
            </div>
            <div className="pt-8 border-t">{workflow && <BasicWorkflowDataForm workflow={workflow} />}</div>
            {workflow && <WorkflowFields workflow={workflow} />}
            {workflow?.configuration.tables && workflow.configuration.tables.length > 0 && (
                <>
                    <h3 className="text-lg font-medium">Tables</h3>
                    <div className="space-y-4">
                        {workflow.configuration.tables.map((table) => (
                            <div key={table.name} className="p-4 border rounded-lg">
                                <h4 className="text-md font-medium">{table.name}</h4>
                                <p className="text-muted-foreground text-sm mb-3">{table.description}</p>
                                <div className="mt-4">
                                    <h5 className="text-sm font-medium mb-2">Columns:</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {table.columns.map((column) => (
                                            <div key={column.name} className="p-2 bg-muted rounded text-sm">
                                                <span className="font-medium">{column.name}</span>
                                                <span className="text-muted-foreground"> ({column.type})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
