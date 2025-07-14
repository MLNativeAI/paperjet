import { createFileRoute } from "@tanstack/react-router";
import SignInPage from "@/pages/sign-in-page";
import { getAuthMode } from "@/lib/api";

export const Route = createFileRoute("/auth/sign-in")({
  beforeLoad: async () => {
    const { authMode } = await getAuthMode()
    return { authMode }
  },
  component: SignInPage,
});
