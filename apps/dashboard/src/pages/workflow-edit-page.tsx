import type { Workflow } from "@paperjet/engine/types";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useWorkflowConfig, WorkflowConfigProvider } from "@/components/workflow/editor/workflow-config-context";
import { WorkflowForm } from "@/components/workflow/editor/workflow-form";

interface WorkflowEditPageProps {
  workflow: Workflow;
}

function WorkflowEditPageContent() {
  const { updateWorkflow } = useWorkflowConfig();
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      await updateWorkflow.mutateAsync();
      toast.success("Workflow saved successfully");
      navigate({ to: "/" });
    } catch (error) {
      toast.error("Failed to save workflow");
      console.error("Error saving workflow:", error);
    }
  };

  return (
    <WorkflowForm
      title="Edit Workflow"
      subtitle="Edit the objects, fields and tables for your document processing workflow."
      handleSave={handleSave}
      isPending={updateWorkflow.isPending}
      buttonText="Save Changes"
    />
  );
}

export default function WorkflowEditPage({ workflow }: WorkflowEditPageProps) {
  return (
    <WorkflowConfigProvider initialWorkflow={workflow}>
      <WorkflowEditPageContent />
    </WorkflowConfigProvider>
  );
}
