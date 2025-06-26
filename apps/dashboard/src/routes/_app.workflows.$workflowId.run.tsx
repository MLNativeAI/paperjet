import { createFileRoute } from "@tanstack/react-router";
import WorkflowExecutorPage from "@/pages/WorkflowExecutorPage";

export const Route = createFileRoute("/_app/workflows/$workflowId/run")({
  component: WorkflowExecutorPage,
});