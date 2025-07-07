import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCreateWorkflow } from "@/hooks/use-create-workflow";
import { FileUploadArea } from "../file-upload-area";

export default function WorkflowUploadSection() {
  const navigate = useNavigate();
  const { createWorkflowFromFile, analyzeWorkflow } = useCreateWorkflow();

  const handleFileSelect = (selectedFile: File) => {
    createWorkflowFromFile.mutate(selectedFile, {
      onSuccess: (data) => {
        // Trigger analysis immediately after workflow creation
        analyzeWorkflow.mutate(data.workflowId);
        navigate({ to: `/workflows/${data.workflowId}/loading` });
      },
      onError: () => {
        toast.error("Failed to create workflow from file");
      },
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 border-t pt-8">
        Create a custom workflow...
      </h2>
      <p className="text-muted-foreground mb-6">
        Upload any document and we'll analyze it to suggest extraction fields
      </p>

      <FileUploadArea onFileSelect={handleFileSelect} />
    </div>
  );
}
