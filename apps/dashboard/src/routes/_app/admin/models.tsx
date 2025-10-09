import { createFileRoute } from "@tanstack/react-router";
import AdminModelsPage from "@/pages/admin/models-page";

export const Route = createFileRoute("/_app/admin/models")({
  component: AdminModelsPage,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/admin",
          label: "Admin",
        },
        {
          link: "/admin/models",
          label: "Model Configuration",
        },
      ],
    };
  },
});
