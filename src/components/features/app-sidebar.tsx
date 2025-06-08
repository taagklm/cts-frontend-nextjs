"use client"

import * as React from "react"
import {
    Home,
    Activity,
    Notebook,
    ChevronRight,
    UserCog,
} from "lucide-react"
import { NavUser } from "@/components/features/nav-user"
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { usePathname } from 'next/navigation'
import { sampleUser } from "@/mock-data/sample-user"

// Menu items
const traderGroupItems = [
    {
        title: "Home",
        url: "/trader-platform/home",
        icon: Home,
    },
    {
        title: "Journal",
        url: "/trader-platform/journal",
        icon: Notebook,
    },
]

const riskGroupItems = [
    {
        title: "Dashboard",
        icon: Activity,
        url: "/risk-platform/dashboard",
        isActive: false,
        items: [
            {
                title: "Traders",
                url: "/risk-platform/dashboard/traders",
            },
        ],
    },
    {
        title: "Admin Tools",
        icon: UserCog,
        url: "/risk-platform/admin-tools",
        isActive: false,
        items: [
            {
                title: "Users",
                url: "/risk-platform/admin-tools/users",
            },
            {
                title: "Tradeblocks",
                url: "/risk-platform/admin-tools/tradeblocks",
            },
        ],
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname() ?? "";

    return (
        <Sidebar collapsible="icon" {...props}>
            <div className="mt-3" />
            <SidebarHeader>
                <NavUser user={sampleUser.user} />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Trader Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {traderGroupItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Risk Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        {riskGroupItems.map((item) => {
                            const isActive = pathname
                                ? pathname.startsWith(item.url) ||
                                item.items?.some((subItem) => pathname.startsWith(subItem.url))
                                : true;
                            return (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={isActive}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={item.title}>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={pathname === subItem.url}
                                                        >
                                                            <a href={subItem.url}>
                                                                <span>{subItem.title}</span>
                                                            </a>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}