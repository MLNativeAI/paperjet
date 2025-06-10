import SignUpPage from "@/pages/SignUpPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-up")({
  component: SignUpPage,
});
