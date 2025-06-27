import { createFileRoute } from "@tanstack/react-router";
import WorkflowListPage from "@/pages/workflow-list-page";

export const Route = createFileRoute("/_app/")({
    component: WorkflowListPage,
});
