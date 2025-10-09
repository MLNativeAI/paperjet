import { createFileRoute, redirect } from "@tanstack/react-router";
import AdminSetupPage from "@/pages/admin-setup-page";

export const Route = createFileRoute("/admin/setup")({
  beforeLoad: async ({ context }) => {
    if (context.serverInfo?.adminAccountExists) {
      throw redirect({
        to: "/",
      });
    }
    return {
      breadcrumbs: [
        {
          link: "/admin/setup",
          label: "Admin Setup",
        },
      ],
    };
  },
  component: AdminSetupPage,
});
