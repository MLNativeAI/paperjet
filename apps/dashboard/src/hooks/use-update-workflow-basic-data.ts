import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface UpdateWorkflowBasicDataParams {
    workflowId: string;
    name: string;
    description?: string;
}

export function useUpdateWorkflowBasicData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workflowId, name, description }: UpdateWorkflowBasicDataParams) => {
            const response = await api.workflows[":id"]["basic-data"].$patch({
                param: { id: workflowId },
                json: { name, description },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update workflow");
            }

            return response.json();
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