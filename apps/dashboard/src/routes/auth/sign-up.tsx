import { createFileRoute } from "@tanstack/react-router";
import SignUpPage from "@/pages/sign-up-page";
import { getAuthMode } from "@/lib/api";

export const Route = createFileRoute("/auth/sign-up")({
  beforeLoad: async () => {
    const { authMode } = await getAuthMode()
    return { authMode }
  },
  component: SignUpPage,
});
