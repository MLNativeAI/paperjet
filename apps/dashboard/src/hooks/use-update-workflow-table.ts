import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface UpdateWorkflowTableParams {
  workflowId: string;
  tableId: string;
  updates: {
    name?: string;
    description?: string;
    columns?: Array<{
      id?: string;
      name: string;
      description: string;
      type: "text" | "number" | "date" | "currency" | "boolean";
    }>;
    categoryId?: string;
  };
}

export function useUpdateWorkflowTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      tableId,
      updates,
    }: UpdateWorkflowTableParams) => {
      const response = await api.workflows[":id"].tables[":tableId"].$patch({
        param: { id: workflowId, tableId },
        json: updates,
      });

      if (!response.ok) {
        const error = await response.json();
        if ("details" in error && Array.isArray(error.details)) {
          // Format validation errors
          const messages = error.details
            .map((d: any) => `${d.field}: ${d.message}`)
            .join(", ");
          throw new Error(messages);
        }
        throw new Error(error.error || "Failed to update table");
      }

      return response.json();
    },
    onSuccess: (_, { workflowId }) => {
      // Invalidate the workflow query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });

      toast.success("Table updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update table");
    },
  });
}
