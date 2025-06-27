import { createFileRoute } from "@tanstack/react-router";
import WorkflowExecutorPage from "@/pages/workflow-executor-page";

export const Route = createFileRoute("/_app/workflows/$workflowId/run")({
    component: WorkflowExecutorPage,
});
