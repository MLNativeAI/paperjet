import { createFileRoute } from "@tanstack/react-router";
import SignUpPage from "@/pages/SignUpPage";

export const Route = createFileRoute("/auth/sign-up")({
  component: SignUpPage,
});
