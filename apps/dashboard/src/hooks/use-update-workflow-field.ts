import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateWorkflowField } from "@/lib/api";

interface UpdateWorkflowFieldParams {
    workflowId: string;
    fieldId: string;
    updates: {
        name?: string;
        description?: string;
        type?: "text" | "number" | "date" | "currency" | "boolean";
        required?: boolean;
        categoryId?: string;
    };
}

export function useUpdateWorkflowField() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workflowId, fieldId, updates }: UpdateWorkflowFieldParams) => {
            return updateWorkflowField(workflowId, fieldId, updates);
        },
        onSuccess: (_, { workflowId }) => {
            // Invalidate the workflow query to refresh the data
            queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
            queryClient.invalidateQueries({ queryKey: ["workflows"] });

            toast.success("Field updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update field");
        },
    });
}
