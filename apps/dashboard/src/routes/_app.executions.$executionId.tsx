import { createFileRoute } from "@tanstack/react-router";
import ExecutionDetailPage from "@/pages/ExecutionDetailPage";

export const Route = createFileRoute("/_app/executions/$executionId")({
  component: ExecutionDetailPage,
});