import { createFileRoute } from "@tanstack/react-router";
import WorkflowCreatorPage from "@/pages/workflow-creator-page";

export const Route = createFileRoute("/_app/workflows/new")({
    component: WorkflowCreatorPage,
});
