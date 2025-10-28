import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import BillingPage from "@/pages/settings/billing";

export const Route = createFileRoute("/_app/settings/billing")({
  component: BillingPage,
  validateSearch: z.object({
    checkout_id: z.coerce.string().optional(),
    checkout_success: z.boolean().optional(),
  }),
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
