import { useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import BasicWorkflowDataForm, { type BasicWorkflowDataFormRef } from "@/components/workflow/basic-workflow-data-form";
import WorkflowCategories from "@/components/workflow/workflow-categories";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useUpdateWorkflowBasicData } from "@/hooks/use-update-workflow-basic-data";

export default function WorkflowFinalizePage() {
    const { workflowId } = useParams({
        from: "/_app/workflows/$workflowId/finalize",
    });

    const { workflow } = useWorkflow(workflowId);
    const { mutate: updateWorkflow, isPending } = useUpdateWorkflowBasicData();
    const formRef = useRef<BasicWorkflowDataFormRef>(null);
    const [showWorkflowConfiguration, setShowWorkflowConfiguration] = useState(true);

    const handleSaveWorkflow = async () => {
        if (!formRef.current || !workflow) return;

        const formData = await formRef.current.submit();
        if (formData) {
            updateWorkflow({
                workflowId: workflow.id,
                name: formData.name,
                description: formData.description,
            });
        }
    };

    return (
        <div className="w-full px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Finalize Workflow</h1>
                    <p className="text-muted-foreground mt-2">Review, customize and save your workflow</p>
                </div>
            </div>

            {/* Workflow Basic Info Form */}
            <div className="pt-8 border-t">
                {workflow && <BasicWorkflowDataForm ref={formRef} workflow={workflow} />}
            </div>

            {/* Categories with Fields and Tables */}
            {workflow && showWorkflowConfiguration && (
                <div className="pt-8 border-t">
                    <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold mb-6">Workflow Configuration</h2>
                    <div className="flex items-center gap-6">
                        <Button
                            variant="outline"
                            onClick={() => console.log("Configure sections clicked")}
                        >
                            Configure sections
                        </Button>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="workflow-config"
                                checked={showWorkflowConfiguration}
                                onCheckedChange={setShowWorkflowConfiguration}
                            />
                            <Label htmlFor="workflow-config" className="cursor-pointer">
                                Workflow configuration
                            </Label>
                        </div>
                    </div>
                    </div>

                    <WorkflowCategories workflow={workflow} />
                </div>
            )}

            {/* Action Row */}
            {workflow && (
                <div className="flex items-center justify-end pt-8 border-t">


                    <Button
                        size="lg"
                        onClick={handleSaveWorkflow}
                        disabled={isPending}
                    >
                        {isPending ? "Saving..." : "Save Workflow"}
                    </Button>
                </div>
            )}
        </div>
    );
}
