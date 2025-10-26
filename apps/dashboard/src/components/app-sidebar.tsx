import { Link } from "@tanstack/react-router";
import { BookOpen, FileText, Play, Settings, Shield } from "lucide-react";
import type * as React from "react";
import { useMemo } from "react";
import { OrgSwitcher } from "@/components/org-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useBilling } from "@/hooks/use-billing";
import { useAuthenticatedUser } from "@/hooks/use-user";
import CheckoutButton from "./checkout-button";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Workflows",
      url: "/",
      icon: FileText,
    },
    {
      title: "Executions",
      url: "/executions",
      icon: Play,
    },
    {
      title: "Settings",
      url: "/settings/api-keys",
      icon: Settings,
    },
    {
      title: "Admin",
      url: "/admin/models",
      icon: Shield,
      adminOnly: true,
    },
    {
      title: "Documentation",
      url: "https://docs.getpaperjet.com/",
      icon: BookOpen,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, session } = useAuthenticatedUser();
  const { customerState } = useBilling();
  const isAdmin = useMemo(() => user?.role === "superadmin", [user?.role]);

  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <OrgSwitcher />
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => {
              const isExternal = item.url.startsWith("http");
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton hidden={item.adminOnly && !isAdmin} asChild>
                    {isExternal ? (
                      <a
                        href={item.url}
                        className="font-medium flex items-center gap-2"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <Link
                        to={item.url}
                        activeProps={{
                          className: "bg-sidebar-accent text-sidebar-accent-foreground",
                        }}
                        className="font-medium flex items-center gap-2"
                        viewTransition={{ types: ["cross-fade"] }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        {session?.activeOrganizationId && customerState?.activeSubscriptions?.length === 0 && (
          <CheckoutButton organizationId={session.activeOrganizationId} />
        )}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
