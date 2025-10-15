import { createFileRoute } from "@tanstack/react-router";
import WorkflowWizardPage from "@/pages/workflow-wizard-page";

export const Route = createFileRoute("/_app/workflows/wizard")({
  component: WorkflowWizardPage,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/workflows",
          label: "Workflows",
        },
        {
          link: "/wizard",
          label: "New workflow",
        },
      ],
    };
  },
});
