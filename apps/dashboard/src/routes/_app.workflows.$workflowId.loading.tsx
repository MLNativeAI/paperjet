import { createFileRoute } from "@tanstack/react-router";
import WorkflowLoadingPage from "@/pages/workflow-loading-page";

export const Route = createFileRoute("/_app/workflows/$workflowId/loading")({
  component: WorkflowLoadingPage,
});
