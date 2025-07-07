import { createFileRoute } from "@tanstack/react-router";
import WorkflowHistoryPage from "@/pages/workflow-history-page";

export const Route = createFileRoute("/_app/workflows/$workflowId/history")({
  component: WorkflowHistoryPage,
});
