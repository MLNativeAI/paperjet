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
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Workflows",
            url: "/",
        },
        {
            title: "Runs",
            url: "/runs",
        },
        {
            title: "Settings",
            url: "/settings",
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
                                        <a href={item.url}>{item.title}</a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
