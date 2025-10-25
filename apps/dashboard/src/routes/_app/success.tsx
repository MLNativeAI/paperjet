import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_app/success")({
  component: RouteComponent,
  validateSearch: z.object({
    checkout_id: z.string().optional().catch("/"),
  }),
});

function RouteComponent() {
  const { checkout_id } = Route.useSearch();
  console.log(checkout_id);
  return <div>Checkout completed</div>;
}
