import { BookOpen, FileText, Play, Settings } from "lucide-react";
import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Workflows",
      url: "/",
      icon: FileText,
    },
    {
      title: "Runs",
      url: "/runs",
      icon: Play,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Documentation",
      url: "https://docs.getpaperjet.com/",
      icon: BookOpen,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <img src="/logo.png" alt="PaperJet" className="h-8 w-8" />
          <span className="font-semibold text-lg">PaperJet</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      target={item.url.startsWith("http") ? "_blank" : undefined}
                      rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
