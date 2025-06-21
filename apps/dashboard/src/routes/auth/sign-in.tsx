import { createFileRoute } from "@tanstack/react-router";
import SignInPage from "@/pages/SignInPage";

export const Route = createFileRoute("/auth/sign-in")({
  component: SignInPage,
});
