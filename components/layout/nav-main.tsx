"use client"

import {
    LayoutDashboard,
    ShoppingCart,
    ClipboardList,
    Layers,
    Computer,
    Tablet,
    DollarSign,
    Box,
    Store,
    Menu,
    type LucideIcon,
} from "lucide-react"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { Path } from "@/constants/path"
import { useEffect, useRef } from "react"

// Định nghĩa các section menu
type MenuItem = {
    title: string
    url: string
    icon: LucideIcon
}

type MenuSection = {
    title: string
    items: MenuItem[]
}

// Phân chia menu thành các section
const menuSections: MenuSection[] = [
    {
        title: "Tổng quan",
        items: [
            {
                title: "Dashboard",
                url: Path.DASHBOARD,
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "Quản lý đơn hàng",
        items: [
            {
                title: "Quản lý đơn hàng",
                url: Path.MANAGE_ORDERS,
                icon: ShoppingCart,
            },
        ],
    },
    {
        title: "Quản lý sản xuất",
        items: [
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
        ],
    },
    {
        title: "Quản lý thiết bị",
        items: [
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
        ],
    },
    {
        title: "Quản lý kinh doanh",
        items: [
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
        ],
    },
]

export function NavMain() {
    const path = usePathname()
    const activeItemRef = useRef<HTMLAnchorElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Tự động cuộn đến mục đang active khi component mount hoặc path thay đổi
    useEffect(() => {
        if (activeItemRef.current && containerRef.current) {
            // Tính toán vị trí cuộn
            const container = containerRef.current
            const activeItem = activeItemRef.current
            const containerHeight = container.clientHeight
            const activeItemTop = activeItem.offsetTop
            const activeItemHeight = activeItem.clientHeight

            // Cuộn để mục active nằm ở giữa container nếu có thể
            const scrollTo = activeItemTop - containerHeight / 2 + activeItemHeight / 2

            // Cuộn mượt đến vị trí
            container.scrollTo({
                top: Math.max(0, scrollTo),
                behavior: "smooth",
            })
        }
    }, [path])

    return (
        <div ref={containerRef} className="h-full overflow-y-auto no-scrollbar">
            {menuSections.map((section, index) => (
                <SidebarGroup key={index} className="mb-4">
                    <SidebarGroupLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 group-data-[collapsible=icon]:hidden">
                        {section.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {section.items.map((item) => {
                            const isActive = path === item.url
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a
                                            ref={isActive ? activeItemRef : null}
                                            className={`transition-all duration-200 hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] ${isActive ? "bg-[#e1f9f9] dark:bg-[#1a3333]" : ""
                                                }`}
                                            href={item.url}
                                        >
                                            {item.icon && <item.icon className={`${isActive ? "text-[#68e0df]" : "text-[#68e0df]"}`} />}
                                            <span
                                                className={`text-gray-600 dark:text-gray-300 group-data-[collapsible=icon]:hidden ${isActive ? "font-medium" : ""
                                                    }`}
                                            >
                                                {item.title}
                                            </span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    )
}
