import { createFileRoute } from "@tanstack/react-router";
import OrganizationPage from "@/pages/settings/organization";

export const Route = createFileRoute("/_app/settings/organization")({
  component: OrganizationPage,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/settings",
          label: "Settings",
        },
        {
          link: "/settings/organization",
          label: "Organization",
        },
      ],
    };
  },
});
