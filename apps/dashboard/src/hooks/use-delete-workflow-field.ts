import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteWorkflowField } from "@/lib/api";

interface DeleteFieldParams {
    workflowId: string;
    fieldId: string;
}

export function useDeleteWorkflowField() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workflowId, fieldId }: DeleteFieldParams) => {
            return deleteWorkflowField(workflowId, fieldId);
        },
        onSuccess: (_, { workflowId }) => {
            queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
            toast.success("Field deleted successfully");
        },
        onError: (error: Error) => {
            console.error("Delete field error:", error);
            toast.error(error.message || "Failed to delete field");
        },
    });
}
