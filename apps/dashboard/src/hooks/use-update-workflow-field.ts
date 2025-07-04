import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

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
            const response = await api.workflows[":id"].fields[":fieldId"].$patch({
                param: { id: workflowId, fieldId },
                json: updates,
            });

            if (!response.ok) {
                const error = await response.json();
                if ("details" in error && Array.isArray(error.details)) {
                    // Format validation errors
                    const messages = error.details.map((d: any) => `${d.field}: ${d.message}`).join(", ");
                    throw new Error(messages);
                }
                throw new Error(error.error || "Failed to update field");
            }

            return response.json();
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
