import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateWorkflowBasicData } from "@/lib/api";

interface UpdateWorkflowBasicDataParams {
  workflowId: string;
  slug: string;
  description?: string;
}

export function useUpdateWorkflowBasicData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, slug, description }: UpdateWorkflowBasicDataParams) => {
      return updateWorkflowBasicData(workflowId, { slug, description });
    },
    onSuccess: (_, { workflowId }) => {
      // Invalidate the workflow query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });

      toast.success("Workflow updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update workflow");
    },
  });
}
