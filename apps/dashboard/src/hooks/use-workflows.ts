import type { WorkflowRoutes } from "@paperjet/api/routes";
import type { Workflow } from "@paperjet/engine/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hc } from "hono/client";
import { toast } from "sonner";
import { deleteWorkflowMutation } from "@/lib/api/workflow";

const workflowClient = hc<WorkflowRoutes>("/api/v1/workflows");

export function useWorkflows() {
  const queryClient = useQueryClient();

  const {
    data: workflows = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["workflows"],
    queryFn: async (): Promise<Workflow[]> => {
      const response = await workflowClient.index.$get({});

      if (!response.ok) {
        console.log("Failed to fetch workflow");
        throw new Error("Failed to fetch workflow");
      }

      return response.json();
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: ({ workflowId }: { workflowId: string }) => deleteWorkflowMutation(workflowId),
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

export function useWorkflow(workflowId: string) {
  const {
    data: workflow,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async (): Promise<Workflow> => {
      const response = await workflowClient[":workflowId"].$get({
        param: { workflowId },
      });

      if (!response.ok) {
        console.log("Failed to fetch workflow");
        throw new Error("Failed to fetch workflow");
      }

      const data = await response.json();
      return data as unknown as Workflow;
    },
    enabled: !!workflowId,
  });

  return {
    workflow,
    isLoading,
    error,
  };
}
