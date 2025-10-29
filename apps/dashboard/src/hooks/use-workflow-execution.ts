import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useWorkflowExecution(workflowId: string) {
  const navigate = useNavigate();
  const executeWorkflow = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const executeResponse = await fetch(`/api/v1/workflows/${workflowId}/execute`, {
        method: "POST",
        body: formData,
      });

      if (!executeResponse.ok) {
        const errorData = await executeResponse.json().catch(() => ({}));
        throw {
          status: executeResponse.status,
          message: errorData.error || `HTTP error! status: ${executeResponse.status}`,
          code: errorData.code,
        };
      }

      return executeResponse.json();
    },
    onSuccess: () => {
      toast.success("Successfully submitted a new execution");
    },
    onError: (error: any) => {
      if (error.code === "PRO_PLAN_REQUIRED") {
        toast.error("PDFs with more than 20 pages require a pro plan", {
          action: {
            label: "Upgrade",
            onClick: () => {
              navigate({ to: "/settings/billing" });
            },
          },
        });
      } else {
        toast.error(error.message || "Failed to execute workflow");
      }
      console.error("Execution error:", error);
    },
  });

  return {
    executeWorkflow,
  };
}
