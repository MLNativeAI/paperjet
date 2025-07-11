import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { api } from "@/lib/api";
import "../../styles.css";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    // Skip setup check for certain routes
    const skipRoutes = ["/setup", "/auth/sign-in", "/auth/sign-up", "/auth/verify-magic-link"];
    if (skipRoutes.some(route => location.pathname.startsWith(route))) {
      return;
    }

    try {
      // Check if setup is needed
      const response = await api.setup.status.$get();
      const data = await response.json();
      
      if (data.needsSetup) {
        // Redirect to setup page
        throw redirect({
          to: "/setup",
        });
      }
    } catch (error) {
      // If it's not a redirect error, log it
      if (!(error instanceof Error && error.message.includes("redirect"))) {
        console.error("Failed to check setup status:", error);
      } else {
        throw error; // Re-throw redirect errors
      }
    }
  },
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </>
  ),
  notFoundComponent: () => <div>404 Not Found</div>,
});
