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
                {workflow && <BasicWorkflowDataForm workflow={workflow} />}
            </div>
            <h3 className="text-lg font-medium">Fields</h3>
            <div className="grid grid-cols-2 gap-4">
            {workflow?.configuration.fields.map((field) => (
                <div key={field.name}>
                    <h4 className="text-md font-medium">{field.name}</h4>
                    <p className="text-muted-foreground">{field.description}</p>
                </div>
            ))}
            </div>

        </div>
    );
}
