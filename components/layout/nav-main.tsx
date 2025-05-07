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
    ChevronRight,
    Settings,
    Cpu,
    HardDrive,
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
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type BaseMenuItem = {
    title: string
    icon: LucideIcon
}

type StandardMenuItem = BaseMenuItem & {
    url: string
    children?: never
}

type DropdownMenuItem = BaseMenuItem & {
    url?: never
    children: StandardMenuItem[]
}

type MenuItem = StandardMenuItem | DropdownMenuItem

type MenuSection = {
    title: string
    items: MenuItem[]
}

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
                icon: Computer,
                children: [
                    {
                        title: "Thiết bị",
                        url: Path.MANAGE_DEVICES,
                        icon: Cpu,
                    },
                    {
                        title: "Loại thiết bị",
                        url: Path.MANAGE_DEVICE_TYPES,
                        icon: Settings,
                    },
                    {
                        title: "Mẫu thiết bị",
                        url: Path.MANAGE_DEVICE_MODELS,
                        icon: HardDrive,
                    },
                ],
            },
            {
                title: "Quản lý kiosk",
                icon: Tablet,
                children: [
                    {
                        title: "Kiosk",
                        url: Path.MANAGE_KIOSKS,
                        icon: Cpu,
                    },
                    {
                        title: "Loại kiosk",
                        url: "/manage-kiosk-types",
                        icon: Settings,
                    },
                    {
                        title: "Mẫu kiosk",
                        url: "/manage-kiosk-version",
                        icon: HardDrive,
                    },
                ],
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
                title: "Quản lý tổ chức",
                url: Path.MANAGE_ORGANIZATIONS,
                icon: DollarSign,
            },
            {
                title: "Quản lý sản phẩm",
                url: Path.MANAGE_PRODUCTS,
                icon: Box,
            },
            {
                title: "Quản lý cửa hàng",
                url: Path.MANAGE_STORES,
                icon: Store,
            },
            {
                title: "Quản lý menu",
                url: Path.MANAGE_MENUS,
                icon: Menu,
            },
            {
                title: "Quản lý location",
                url: Path.MANAGE_LOCATION_TYPES,
                icon: Menu,
            },
        ],
    },
]


export function NavMain() {
    const path = usePathname()
    const activeItemRef = useRef<HTMLAnchorElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})

    const isDropdownActive = (children: StandardMenuItem[]) => {
        return children.some((child) => child.url === path)
    }

    useEffect(() => {
        const initialOpenState: Record<string, boolean> = {}
        menuSections.forEach((section) => {
            section.items.forEach((item) => {
                if ("children" in item && item.children) {
                    const isActive = isDropdownActive(item.children)
                    if (isActive) {
                        initialOpenState[item.title] = true
                    }
                }
            })
        })
        setOpenDropdowns(initialOpenState)
    }, [path])

    useEffect(() => {
        if (activeItemRef.current && containerRef.current) {
            const container = containerRef.current
            const activeItem = activeItemRef.current

            const containerRect = container.getBoundingClientRect()
            const activeItemRect = activeItem.getBoundingClientRect()

            const isFullyVisible =
                activeItemRect.top >= containerRect.top &&
                activeItemRect.bottom <= containerRect.bottom

            if (!isFullyVisible) {
                const containerHeight = container.clientHeight
                const activeItemTop = activeItem.offsetTop
                const activeItemHeight = activeItem.clientHeight

                const scrollToPosition = activeItemTop - containerHeight / 2 + activeItemHeight / 2

                container.scrollTo({
                    top: Math.max(0, scrollToPosition),
                    behavior: "smooth",
                })
            }
        }
    }, [path, openDropdowns, activeItemRef.current])

    const toggleDropdown = (title: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [title]: !prev[title],
        }))
    }

    return (
        <div ref={containerRef} className="h-full overflow-y-auto no-scrollbar">
            {menuSections.map((section, index) => (
                <SidebarGroup key={index} className="mb-4">
                    <SidebarGroupLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 group-data-[collapsible=icon]:hidden">
                        {section.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {section.items.map((item) => {
                            if (!("children" in item) || !item.children) {
                                const isActive = path === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title}>
                                            <a
                                                ref={isActive ? activeItemRef : null}
                                                className={`transition-all duration-200 hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] ${isActive ? "bg-[#e1f9f9] dark:bg-[#1a3333]" : ""}`}
                                                href={item.url}
                                            >
                                                {item.icon && (
                                                    <item.icon className={`size-4 text-[#68e0df]`} />
                                                )}
                                                <span
                                                    className={`text-gray-600 dark:text-gray-300 group-data-[collapsible=icon]:hidden ${isActive ? "font-medium" : ""}`}
                                                >
                                                    {item.title}
                                                </span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            } else {
                                const isActiveParent = isDropdownActive(item.children)
                                const isOpen = openDropdowns[item.title] || false

                                return (
                                    <div key={item.title} className="space-y-1">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild tooltip={item.title}>
                                                <button
                                                    onClick={() => toggleDropdown(item.title)}
                                                    className={`flex w-full items-center justify-between transition-all duration-200 hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] ${isActiveParent ? "bg-[#e1f9f9] dark:bg-[#1a3333]" : ""}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {item.icon && (
                                                            <item.icon
                                                                className={`size-4 text-[#68e0df]`}
                                                            />
                                                        )}
                                                        <span className="text-gray-600 dark:text-gray-300 group-data-[collapsible=icon]:hidden">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <ChevronRight
                                                        className={cn(
                                                            "h-4 w-4 text-gray-500 transition-transform",
                                                            isOpen && "rotate-90"
                                                        )}
                                                    />
                                                </button>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>

                                        {isOpen && (
                                            <div className="pl-6 border-l border-border ml-3 mt-1 space-y-1">
                                                {item.children.map((child) => {
                                                    const isChildActive = path === child.url
                                                    return (
                                                        <SidebarMenuItem key={child.title}>
                                                            <SidebarMenuButton asChild tooltip={child.title}>
                                                                <a
                                                                    ref={isChildActive ? activeItemRef : null}
                                                                    className={`transition-all duration-200 hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] ${isChildActive ? "bg-[#e1f9f9] dark:bg-[#1a3333]" : ""}`}
                                                                    href={child.url}
                                                                >
                                                                    {child.icon && (
                                                                        <child.icon
                                                                            className={`size-4 text-[#68e0df]`}
                                                                        />
                                                                    )}
                                                                    <span
                                                                        className={`text-gray-600 dark:text-gray-300 group-data-[collapsible=icon]:hidden ${isChildActive ? "font-medium" : ""}`}
                                                                    >
                                                                        {child.title}
                                                                    </span>
                                                                </a>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    )
}