import { createFileRoute } from "@tanstack/react-router";
import BillingPage from "@/pages/settings/billing";
import z from "zod";

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
