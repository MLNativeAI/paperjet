import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import WorkflowUploadSection from "@/components/workflow/workflow-upload-section";
import { WorkflowTemplateCard } from "@/components/workflow-template-card";
import { workflowTemplates } from "@/data/workflow-templates";
import { useCreateWorkflow } from "@/hooks/use-create-workflow";
import { prepareTemplateData, type WorkflowTemplate } from "@/lib/template-utils";

export default function WorkflowCreatorPage() {
  const navigate = useNavigate();
  const { createWorkflowFromTemplate } = useCreateWorkflow();

  const handleTemplateSelect = async (template: WorkflowTemplate) => {
    try {
      const templateData = await prepareTemplateData(template);

      createWorkflowFromTemplate.mutate(templateData, {
        onSuccess: (data) => {
          toast.success("Workflow created successfully!");
          navigate({ to: `/workflows/${data.workflowId}/finalize` });
        },
        onError: (error) => {
          console.error("Error creating workflow from template:", error);
          toast.error("Failed to create workflow from template");
        },
      });
    } catch (error) {
      console.error("Error preparing template data:", error);
      toast.error("Failed to prepare template data");
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Create New Workflow</h1>
        <p className="text-muted-foreground">
          Choose a template to get started or create a custom workflow from scratch
        </p>
      </div>

      <div className="space-y-8">
        {/* Custom Workflow Option */}
        <WorkflowUploadSection />

        {/* Template Selection */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">...or choose from a template</h2>
          <p className="text-muted-foreground mb-6">Start with a pre-built workflow for common document types</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.map((template) => (
              <WorkflowTemplateCard
                key={template.id}
                template={template}
                onClick={(templateId) => {
                  const selectedTemplate = workflowTemplates.find((t) => t.id === templateId);
                  if (selectedTemplate) {
                    handleTemplateSelect(selectedTemplate);
                  }
                }}
                isLoading={createWorkflowFromTemplate.isPending}
                disabled={createWorkflowFromTemplate.isPending}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </Button>
      </div>
    </div>
  );
}
