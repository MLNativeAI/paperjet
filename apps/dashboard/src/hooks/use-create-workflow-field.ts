import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createWorkflowField } from "@/lib/api";

interface CreateFieldParams {
    workflowId: string;
    field: {
        name: string;
        description: string;
        type: "text" | "number" | "date" | "currency" | "boolean";
        required: boolean;
        categoryId: string;
    };
}

export function useCreateWorkflowField() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workflowId, field }: CreateFieldParams) => {
            return createWorkflowField(workflowId, field);
        },
        onSuccess: (_, { workflowId }) => {
            queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
            toast.success("Field created successfully");
        },
        onError: (error: Error) => {
            console.error("Create field error:", error);
            toast.error(error.message || "Failed to create field");
        },
    });
}