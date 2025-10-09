import type { WorkflowRoutes } from "@paperjet/api/routes";
import type { Workflow } from "@paperjet/engine/types";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { hc } from "hono/client";
import WorkflowEditPage from "@/pages/workflow-edit-page";

const workflowClient = hc<WorkflowRoutes>("/api/v1/workflows");

export const Route = createFileRoute("/_app/workflows/$workflowId/edit")({
  loader: async ({ params }) => {
    try {
      const response = await workflowClient[":workflowId"].$get({
        param: { workflowId: params.workflowId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workflow");
      }

      const workflow: Workflow = await response.json();
      return workflow;
    } catch (error) {
      console.error("Error fetching workflow:", error);
      throw notFound();
    }
  },
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    return {
      breadcrumbs: [
        {
          link: "/",
          label: "Workflows",
        },
        {
          link: `/workflows/${params.workflowId}/edit`,
          label: "Edit workflow",
        },
      ],
    };
  },
});

function RouteComponent() {
  const workflow = Route.useLoaderData();
  return <WorkflowEditPage workflow={workflow} />;
}
