import { createFileRoute } from "@tanstack/react-router";
import WorkflowCreatorPage from "@/pages/WorkflowCreatorPage";

export const Route = createFileRoute("/_app/workflows/new")({
    component: WorkflowCreatorPage,
});
