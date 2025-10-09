import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LogoBanner } from "@/components/logo-banner";

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ context }) => {
    if (!context.serverInfo?.adminAccountExists) {
      throw redirect({
        to: "/admin/setup",
      });
    }
    if (context.session) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10 gap-8">
      <LogoBanner />
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
