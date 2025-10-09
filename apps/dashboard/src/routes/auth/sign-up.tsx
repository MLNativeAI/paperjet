import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import SignUpPage from "@/pages/auth/sign-up-page";

export const Route = createFileRoute("/auth/sign-up")({
  validateSearch: z.object({
    redirectTo: z.string().optional().catch("/"),
    notFound: z.boolean().optional(),
    invitationId: z.string().optional(),
  }),
  beforeLoad: async ({ context }) => {
    if (context.session) {
      throw redirect({ to: "/" });
    }
  },
  component: SignUpPage,
});
