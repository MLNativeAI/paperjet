import { useNavigate, useParams } from "@tanstack/react-router";
import BasicWorkflowDataForm from "@/components/workflow/basic-workflow-data-form";
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
            <div className="pt-8 border-t">
                <BasicWorkflowDataForm workflow={workflow} />
            </div>
        </div>
    );
}
