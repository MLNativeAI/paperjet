import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useWorkflows() {
    const queryClient = useQueryClient();

    const {
        data: workflows = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["workflows"],
        queryFn: async () => {
            const response = await api.workflows.$get();
            if (!response.ok) {
                throw new Error("Failed to fetch workflows");
            }
            return response.json();
        },
    });

    const deleteWorkflow = useMutation({
        mutationFn: async ({ workflowId }: { workflowId: string }) => {
            const response = await fetch(`/api/workflows/${workflowId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to delete workflow");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success("Workflow deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
        onError: () => {
            toast.error("Failed to delete workflow");
        },
    });

    const handleDeleteWorkflow = async (workflowId: string, workflowName: string) => {
        if (!confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
            return;
        }

        deleteWorkflow.mutate({ workflowId });
    };

    return {
        workflows,
        isLoading,
        refetch,
        handleDeleteWorkflow,
        deleteWorkflow,
    };
}
