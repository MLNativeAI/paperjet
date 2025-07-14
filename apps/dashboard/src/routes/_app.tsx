import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { isAdminSetupRequired } from "@/lib/api";

export const Route = createFileRoute("/_app")({
  component: PathlessLayoutComponent,
  beforeLoad: async ({ location }) => {

    const { isSetupRequired } = await isAdminSetupRequired()
    if (isSetupRequired) {
      throw redirect({
        to: "/admin/setup"
      })
    }
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function PathlessLayoutComponent() {
  const location = useLocation();

  // Determine breadcrumb based on current path
  const getBreadcrumbs = () => {
    const pathname = location.pathname;

    if (pathname === "/") {
      return {
        parent: null,
        current: "Workflows",
      };
    }
    if (pathname === "/runs") {
      return {
        parent: null,
        current: "Runs",
      };
    }
    if (pathname === "/settings") {
      return {
        parent: null,
        current: "Settings",
      };
    }
    if (pathname === "/workflows/new") {
      return {
        parent: "Workflows",
        current: "New Workflow",
      };
    }
    if (pathname.match(/^\/workflows\/[^/]+\/finalize$/)) {
      return {
        parent: "Workflows",
        current: "Finalize Workflow",
      };
    }

    // Default fallback
    return {
      parent: "Workflows",
      current: "Dashboard",
    };
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.parent && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">{breadcrumbs.parent}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbs.current}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
