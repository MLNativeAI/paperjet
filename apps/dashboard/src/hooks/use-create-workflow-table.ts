import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createWorkflowTable } from "@/lib/api";

interface CreateTableParams {
  workflowId: string;
  table: {
    slug: string;
    description: string;
    categoryId: string;
    columns: Array<{
      slug: string;
      description: string;
      type: "text" | "number" | "date" | "currency" | "boolean";
    }>;
  };
}

export function useCreateWorkflowTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, table }: CreateTableParams) => {
      return createWorkflowTable(workflowId, table);
    },
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      toast.success("Table created successfully");
    },
    onError: (error: Error) => {
      console.error("Create table error:", error);
      toast.error(error.message || "Failed to create table");
    },
  });
}
