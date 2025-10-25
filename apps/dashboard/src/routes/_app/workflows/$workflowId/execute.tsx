import { createFileRoute } from "@tanstack/react-router";
import { useWorkflow } from "@/hooks/use-workflows";
import WorkflowExecutorPage from "@/pages/workflow-executor-page";

export const Route = createFileRoute("/_app/workflows/$workflowId/execute")({
  component: WorkflowExecuteRoute,
  beforeLoad: ({ params }) => {
    return {
      breadcrumbs: [
        {
          link: "/",
          label: "Workflows",
        },
        {
          link: `/workflows/${params.workflowId}/execute`,
          label: "Execute workflow",
        },
      ],
    };
  },
});

function WorkflowExecuteRoute() {
  const { workflowId } = Route.useParams();
  const { workflow, isLoading, error } = useWorkflow(workflowId);

  if (isLoading) {
    return <div>Loading workflow...</div>;
  }

  if (error) {
    return <div>Error loading workflow: {error.message}</div>;
  }

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return <WorkflowExecutorPage workflow={workflow} />;
}
