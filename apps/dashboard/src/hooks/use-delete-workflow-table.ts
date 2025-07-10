import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteWorkflowTable } from "@/lib/api";

interface DeleteTableParams {
    workflowId: string;
    tableId: string;
}

export function useDeleteWorkflowTable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workflowId, tableId }: DeleteTableParams) => {
            return deleteWorkflowTable(workflowId, tableId);
        },
        onSuccess: (_, { workflowId }) => {
            queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
            toast.success("Table deleted successfully");
        },
        onError: (error: Error) => {
            console.error("Delete table error:", error);
            toast.error(error.message || "Failed to delete table");
        },
    });
}