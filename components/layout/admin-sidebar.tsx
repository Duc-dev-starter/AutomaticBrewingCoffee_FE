"use client"

import * as React from "react"
import Cookies from "js-cookie"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Path from "@/constants/path"
import {
    BookOpen,
    Computer,
    LayoutDashboard,
    Map,
    PieChart,
    Settings2,
} from "lucide-react"

// sidebar nav items
const navMain = [
    {
        title: "Dashboard",
        url: Path.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        title: "Quản lý đơn hàng",
        url: "/manage-orders",
        icon: Map,
    },
    {
        title: "Quản lý công thức",
        url: "/manage-recipes",
        icon: BookOpen,
    },
    {
        title: "Quản lý nguyên liệu",
        url: "/manage-ingredients",
        icon: Map,
    },
    {
        title: "Quản lý thiết bị",
        url: "/manage-devices",
        icon: Computer,
    },
    {
        title: "Quản lý kiosk",
        url: "/manage-kiosks",
        icon: Map,
    },
    {
        title: "Quản lý chi phí",
        url: "#",
        icon: PieChart,
    },
    {
        title: "Quản lý sản phẩm",
        url: "/manage-product",
        icon: PieChart,
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
]

export function AdminSidebar() {
    const [user, setUser] = React.useState<any>(null)

    React.useEffect(() => {
        const userStr = Cookies.get("user")
        if (userStr) {
            try {
                console.log(userStr);
                setUser(JSON.parse(userStr))
            } catch (err) {
                console.error("Error parsing user cookie:", err)
            }
        }
    }, [])

    return (
        <Sidebar collapsible="icon" >
            <SidebarHeader>
                <Link href={Path.HOME}>
                    {/* Logo ở đây nếu có */}
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                {user && <NavUser user={user} />}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
