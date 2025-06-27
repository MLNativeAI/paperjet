import { createFileRoute } from "@tanstack/react-router";
import WorkflowConfigurePage from "@/pages/WorkflowConfigurePage";

export const Route = createFileRoute("/_app/workflows/$workflowId/configure")({
    component: WorkflowConfigurePage,
});
