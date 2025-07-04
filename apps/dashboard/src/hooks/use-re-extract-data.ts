import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useReExtractData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workflowId: string) => {
            const response = await api.workflows[":id"]["re-extract"].$post({
                param: { id: workflowId },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to re-extract data");
            }

            return response.json();
        },
        onSuccess: (_, workflowId) => {
            // Invalidate workflow query to refresh the data
            queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
            
            toast.success("Data extraction started. This may take a few moments.");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to re-extract data");
        },
    });
}