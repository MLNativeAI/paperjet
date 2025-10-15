import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import WorkflowCreatePage from "@/pages/workflow-create-page";

export const Route = createFileRoute("/_app/workflows/new")({
  component: RouteComponent,
  validateSearch: z.object({
    templateId: z.string().optional(),
  }),
  loaderDeps: ({ search: { templateId } }) => ({
    templateId,
  }),
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
