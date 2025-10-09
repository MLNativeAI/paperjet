import { createFileRoute } from "@tanstack/react-router";
import BillingPage from "@/pages/settings/billing";

export const Route = createFileRoute("/_app/settings/billing")({
  component: BillingPage,
  beforeLoad: () => {
    return {
      breadcrumbs: [
        {
          link: "/settings",
          label: "Settings",
        },
        {
          link: "/settings/billing",
          label: "Billing",
        },
      ],
    };
  },
});
