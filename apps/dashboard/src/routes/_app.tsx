import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import z from "zod";
import { AppSidebar } from "@/components/app-sidebar";
import { OnboardingProvider } from "@/components/onboarding-provider";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useQueryNotifications } from "@/hooks/use-query-notifications";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";

export const Route = createFileRoute("/_app")({
  validateSearch: z.object({
    signedIn: z.boolean().optional(),
    newUser: z.boolean().optional(),
    invitationId: z.string().optional(),
  }),
  loaderDeps: ({ search: { invitationId } }) => ({ invitationId }),
  loader: ({ deps: { invitationId } }) => {
    if (invitationId) {
      console.log("redirecting");
      // TODO: we can either redirect to dedicated accept invite page or just handle that implicitly in the auth callback to create the org membership
      throw redirect({
        to: `/settings/organization`,
      });
    }
  },
  component: PathlessLayoutComponent,
  beforeLoad: async ({ context }) => {
    if (!context.serverInfo.adminAccountExists) {
      throw redirect({
        to: "/admin/setup",
      });
    }
    if (!context.session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
});

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
});

function PathlessLayoutComponent() {
  useQueryNotifications();
  const routerState = useRouterState();
  const matches = routerState.matches as any[];

  // Find the first route that has useFullWidth context
  const fullWidthMatch = matches.find((match: any) => match.context?.useFullWidth === true);
  const useFullWidth = fullWidthMatch?.context?.useFullWidth ?? false;

  return (
    <PostHogProvider client={posthog}>
      <OnboardingProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <SiteHeader />
              {useFullWidth ? (
                <Outlet />
              ) : (
                <div className="max-w-7xl mx-auto w-full">
                  <Outlet />
                </div>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </OnboardingProvider>
    </PostHogProvider>
  );
}
