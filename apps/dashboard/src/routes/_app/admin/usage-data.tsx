import { createFileRoute } from "@tanstack/react-router";
import AdminUsagePage from "@/pages/admin-usage-page";

export const Route = createFileRoute("/_app/admin/usage-data")({
  component: AdminUsagePage,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/admin",
          label: "Admin",
        },
        {
          link: "/admin/usage-data",
          label: "Usage",
        },
      ],
    };
  },
});
