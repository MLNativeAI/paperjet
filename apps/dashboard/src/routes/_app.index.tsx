import { createFileRoute } from "@tanstack/react-router";
import WorkflowListPage from "@/pages/WorkflowListPage";

export const Route = createFileRoute("/_app/")({
  component: WorkflowListPage,
});
