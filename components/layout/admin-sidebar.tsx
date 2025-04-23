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
import {
    Box,
    ClipboardList,
    Computer,
    DollarSign,
    Layers,
    LayoutDashboard,
    Menu,
    ShoppingCart,
    Store,
    Tablet,
} from "lucide-react"
import { Path } from "@/constants/path"

// sidebar nav items
const navMain = [
    {
        title: "Dashboard",
        url: Path.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        title: "Quản lý đơn hàng",
        url: Path.MANAGE_ORDERS,
        icon: ShoppingCart,
    },
    {
        title: "Quản lý công thức",
        url: Path.MANAGE_RECIPES,
        icon: ClipboardList,
    },
    {
        title: "Quản lý quy trình",
        url: Path.MANAGE_WORKFLOWS,
        icon: Layers,
    },
    {
        title: "Quản lý thiết bị",
        url: Path.MANAGE_DEVICES,
        icon: Computer,
    },
    {
        title: "Quản lý kiosk",
        url: Path.MANAGE_KIOSKS,
        icon: Tablet,
    },
    {
        title: "Quản lý chi phí",
        url: Path.MANAGE_COSTS,
        icon: DollarSign,
    },
    {
        title: "Quản lý sản phẩm",
        url: Path.MANAGE_PRODUCTS,
        icon: Box,
    },
    {
        title: "Quản lý chi nhánh",
        url: Path.MANAGE_FRANCHISES,
        icon: Store,
    },
    {
        title: "Quản lý menu",
        url: Path.MANAGE_MENUS,
        icon: Menu,
    },
];

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
                <Link href={Path.DASHBOARD}>
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
