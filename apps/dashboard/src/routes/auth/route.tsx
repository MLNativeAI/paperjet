import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
