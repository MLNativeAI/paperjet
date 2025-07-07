import { createFileRoute } from "@tanstack/react-router";
import RunsPage from "@/pages/runs-page";

export const Route = createFileRoute("/_app/runs")({
  component: RunsPage,
});
