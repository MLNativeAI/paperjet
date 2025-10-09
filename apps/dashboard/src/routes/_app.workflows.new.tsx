import { createFileRoute } from "@tanstack/react-router";
import WorkflowCreatePage from "@/pages/workflow-create-page";

export const Route = createFileRoute("/_app/workflows/new")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.breadcrumbs = [
      {
        link: "/",
        label: "Workflows",
      },
      {
        link: "/workflows/new",
        label: "New workflow",
      },
    ];
  },
});

function RouteComponent() {
  return <WorkflowCreatePage />;
}
