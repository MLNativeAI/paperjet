import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reExtractWorkflowData } from "@/lib/api";

export function useReExtractData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      return reExtractWorkflowData(workflowId);
    },
    onSuccess: (_, workflowId) => {
      // Invalidate workflow query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });

      toast.success("Extraction completed. Data updated successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to re-extract data");
    },
  });
}
