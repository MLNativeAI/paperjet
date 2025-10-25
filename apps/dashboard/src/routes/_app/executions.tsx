import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/executions")({
  component: () => <Outlet />,
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
