import { createFileRoute } from "@tanstack/react-router";
import ExecutionDetailPage from "@/pages/execution-detail-page";

export const Route = createFileRoute("/_app/executions/$executionId")({
    component: ExecutionDetailPage,
});
