"use client"

import * as React from "react"
import {
    BookOpen,
    LayoutDashboard,
    Map,
    PieChart,
    Settings2,
    User,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import Path from "@/constants/path"
// import Images from "@/constants/image"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },

    calendars: [
        {
            name: "My Calendars",
            items: ["Personal", "Work", "Family"],
        },
        {
            name: "Favorites",
            items: ["Holidays", "Birthdays"],
        },
        {
            name: "Other",
            items: ["Travel", "Reminders", "Deadlines"],
        },
    ],

    navMain: [
        {
            title: "Dashboard",
            url: Path.DASHBOARD,
            icon: LayoutDashboard,
            isActive: false,
        },
        {
            title: "Quản lý người dùng",
            url: "#",
            icon: User,
            isActive: true,
            items: [
                {
                    title: "Quản lý khách hàng",
                    url: "/admin/manage-client",
                },
                {
                    title: "Quản lý nhân viên",
                    url: "/admin/manage-foster",
                },

            ],
        },
        {
            title: "Quản lý tin tức",
            url: "/admin/manage-blog",
            icon: BookOpen,
            isActive: false,
        },
        {
            title: "Quản lý danh mục",
            url: "/admin/manage-category",
            icon: Map,
            isActive: false,
        },
        {
            title: "Quản lý chi phí",
            url: "#",
            icon: PieChart,
            isActive: false,
        },
        {
            title: "Quản lý sản phẩm",
            url: "/admin/manage-product",
            icon: PieChart,
            isActive: false,
        },
        {
            title: "Cài đặt",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],

}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <Link href={Path.HOME}>
                    {/* <Image src={Images.LOGO} alt="logo" width={120} height={120} /> */}
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}