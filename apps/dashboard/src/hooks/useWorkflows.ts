import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteWorkflow as deleteWorkflowApi, getAllWorkflows } from "@/lib/api";

export function useWorkflows() {
    const queryClient = useQueryClient();

    const {
        data: workflows = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["workflows"],
        queryFn: getAllWorkflows,
    });

    const deleteWorkflow = useMutation({
        mutationFn: ({ workflowId }: { workflowId: string }) => deleteWorkflowApi(workflowId),
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
