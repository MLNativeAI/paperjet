import { createFileRoute } from "@tanstack/react-router";
import WorkflowHistoryPage from "@/pages/WorkflowHistoryPage";

export const Route = createFileRoute("/_app/workflows/$workflowId/history")({
	component: WorkflowHistoryPage,
});
