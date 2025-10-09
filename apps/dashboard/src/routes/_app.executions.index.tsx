import { createFileRoute } from "@tanstack/react-router";
import ExecutionListPage from "@/pages/execution-list-page";

export const Route = createFileRoute("/_app/executions/")({
  component: ExecutionListPage,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/executions",
          label: "Executions",
        },
        {
          link: "/executions/",
          label: "All executions",
        },
      ],
    };
  },
});
