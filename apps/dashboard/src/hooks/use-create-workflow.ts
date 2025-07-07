import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  analyzeWorkflow as analyzeWorkflowApi,
  createWorkflowFromFile as createWorkflowFromFileApi,
} from "@/lib/api";

export function useCreateWorkflow() {
  const createWorkflowFromFile = useMutation({
    mutationFn: createWorkflowFromFileApi,
    onError: () => {
      toast.error("Failed to create workflow from file");
    },
  });

  const analyzeWorkflow = useMutation({
    mutationFn: (workflowId: string) => analyzeWorkflowApi(workflowId),
    onError: () => {
      toast.error("Failed to analyze document");
    },
  });

  return {
    createWorkflowFromFile,
    analyzeWorkflow,
  };
}
