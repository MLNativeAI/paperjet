import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useWorkflowExecution(workflowId: string) {
  const executeWorkflow = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const executeResponse = await fetch(`/api/v1/workflows/${workflowId}/execute`, {
        method: "POST",
        body: formData,
      });

      if (!executeResponse.ok) {
        throw new Error(`HTTP error! status: ${executeResponse.status}`);
      }

      return executeResponse.json();
    },
    onSuccess: () => {
      toast.success("Successfully submitted a new execution");
    },
    onError: (error) => {
      toast.error("Failed to execute workflow");
      console.error("Execution error:", error);
    },
  });

  return {
    executeWorkflow,
  };
}
