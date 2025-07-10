import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateWorkflowTable } from "@/lib/api";

interface UpdateWorkflowTableParams {
    workflowId: string;
    tableId: string;
    updates: {
        slug?: string;
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
        mutationFn: async ({ workflowId, tableId, updates }: UpdateWorkflowTableParams) => {
            return updateWorkflowTable(workflowId, tableId, updates);
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
