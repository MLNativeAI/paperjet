import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useWorkflowConfig, WorkflowConfigProvider } from "@/components/workflow/editor/workflow-config-context";
import { WorkflowForm } from "@/components/workflow/editor/workflow-form";
import { getTemplateForId } from "@/lib/template";
import { Route } from "@/routes/_app.workflows.new";

function WorkflowCreatePageContent() {
  const { createWorkflow } = useWorkflowConfig();
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      await createWorkflow.mutateAsync();
      toast.success("Workflow created successfully");
      navigate({ to: "/" });
    } catch (error) {
      toast.error("Failed to create workflow");
      console.error("Error creating workflow:", error);
    }
  };

  return (
    <WorkflowForm
      title="Create new Workflow"
      subtitle="Define the objects, fields and tables that you would like to have extracted from your documents."
      handleSave={handleSave}
      isPending={createWorkflow.isPending}
      buttonText="Create Workflow"
    />
  );
}

export default function WorkflowCreatePage() {
  const { templateId } = Route.useSearch();
  if (templateId) {
    const template = getTemplateForId(templateId);
    return (
      <WorkflowConfigProvider template={template}>
        <WorkflowCreatePageContent />
      </WorkflowConfigProvider>
    );
  } else {
    return (
      <WorkflowConfigProvider>
        <WorkflowCreatePageContent />
      </WorkflowConfigProvider>
    );
  }
}
