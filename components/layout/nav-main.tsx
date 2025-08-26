"use client"

import {
    LayoutDashboard,
    ShoppingCart,
    Computer,
    Tablet,
    Store,
    ChevronRight,
    Settings,
    Cpu,
    HardDrive,
    User,
    type LucideIcon,
    Workflow,
    CalendarCheck,
    ListChecks,
    Building2,
    PackageCheck,
    Tags,
    List,
    MapPin,
    UtensilsCrossed,
} from "lucide-react"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem as UIDropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import { Path } from "@/constants/path.constant"
import { useEffect, useRef, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Roles } from "@/enum/role"

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

// Danh sách menu mặc định
const menuSections: MenuSection[] = [
    {
        title: "Tổng quan",
        items: [
            { title: "Dashboard", url: Path.DASHBOARD, icon: LayoutDashboard },
        ],
    },
    {
        title: "Quản lý đơn hàng",
        items: [
            { title: "Quản lý đơn hàng", url: Path.MANAGE_ORDERS, icon: ShoppingCart },
        ],
    },
    {
        title: "Quản lý sản xuất",
        items: [
            { title: "Quản lý quy trình", url: Path.MANAGE_WORKFLOWS, icon: Workflow },
        ],
    },
    {
        title: "Quản lý thiết bị",
        items: [
            {
                title: "Quản lý thiết bị",
                icon: Computer,
                children: [
                    { title: "Thiết bị", url: Path.MANAGE_DEVICES, icon: Cpu },
                    { title: "Loại thiết bị", url: Path.MANAGE_DEVICE_TYPES, icon: Settings },
                    { title: "Mẫu thiết bị", url: Path.MANAGE_DEVICE_MODELS, icon: HardDrive },
                ],
            },
            {
                title: "Quản lý kiosk",
                icon: Tablet,
                children: [
                    { title: "Kiosk", url: Path.MANAGE_KIOSKS, icon: Cpu },
                    { title: "Loại kiosk", url: Path.MANAGE_KIOSK_TYPES, icon: Settings },
                    { title: "Mẫu kiosk", url: Path.MANAGE_KIOSK_VERSIONS, icon: HardDrive },
                ],
            },
        ],
    },
    {
        title: "Quản lý đồng bộ",
        items: [
            { title: "Quản lý đồng bộ sự kiện", url: Path.MANAGE_SYNC_EVENT, icon: CalendarCheck },
            { title: "Quản lý đồng bộ công việc", url: Path.MANAGE_SYNC_TASKS, icon: ListChecks },
        ],
    },
    {
        title: "Quản lý kinh doanh",
        items: [
            { title: "Quản lý tổ chức", url: Path.MANAGE_ORGANIZATIONS, icon: Building2 },
            { title: "Quản lý tài khoản", url: Path.MANAGE_ACCOUNTS, icon: User },
            { title: "Quản lý sản phẩm", url: Path.MANAGE_PRODUCTS, icon: PackageCheck },
            { title: "Quản lý danh mục", url: Path.MANAGE_CATEGORIES, icon: Tags },
            { title: "Quản lý cửa hàng", url: Path.MANAGE_STORES, icon: Store },
            { title: "Quản lý thực đơn", url: Path.MANAGE_MENUS, icon: List },
            { title: "Quản lý loại địa chỉ", url: Path.MANAGE_LOCATION_TYPES, icon: MapPin },
            { title: "Quản lý loại nguyên liệu", url: Path.MANAGE_INGREDIENT_TYPE, icon: UtensilsCrossed },
        ],
    },
]

export function NavMain({ roleName }: { roleName: string | undefined }) {
    const path = usePathname()
    const activeItemRef = useRef<HTMLAnchorElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    const filteredMenuSections = useMemo(() => {
        if (roleName === Roles.ADMIN || !roleName) {
            return menuSections
        } else if (roleName === Roles.ORGANIZATION) {
            return menuSections
                // filter bỏ hẳn section không cần
                .filter(section => section.title !== "Quản lý đồng bộ")
                .filter(section => section.title !== "Quản lý sản xuất")
                // map lại để tùy biến item bên trong
                .map(section => {
                    if (section.title === "Quản lý kinh doanh") {
                        return {
                            ...section,
                            items: section.items.filter(item =>
                                item.title !== "Quản lý location" &&
                                item.title !== "Quản lý tổ chức" &&
                                item.title !== "Quản lý tài khoản" &&
                                item.title !== "Quản lý loại nguyên liệu" &&
                                item.title !== "Quản lý sản phẩm" &&
                                item.title !== "Quản lý danh mục"
                            ),
                        }
                    }
                    else if (section.title === "Quản lý thiết bị") {
                        return {
                            ...section,
                            items: section.items.filter(item =>
                                item.title !== "Quản lý thiết bị"
                            ),
                        }
                    }
                    return section
                })
        }
        return menuSections
    }, [roleName])


    const isDropdownActive = (children: StandardMenuItem[]) => {
        return children.some(child => child.url === path)
    }

    useEffect(() => {
        const initialOpenState: Record<string, boolean> = {}
        filteredMenuSections.forEach(section => {
            section.items.forEach(item => {
                if ("children" in item && item.children) {
                    if (isDropdownActive(item.children)) {
                        initialOpenState[item.title] = true
                    }
                }
            })
        })
        setOpenDropdowns(initialOpenState)
    }, [path, filteredMenuSections])

    useEffect(() => {
        if (activeItemRef.current && containerRef.current) {
            const container = containerRef.current
            const activeItem = activeItemRef.current
            const containerRect = container.getBoundingClientRect()
            const activeItemRect = activeItem.getBoundingClientRect()

            if (!(activeItemRect.top >= containerRect.top && activeItemRect.bottom <= containerRect.bottom)) {
                const scrollToPosition = activeItem.offsetTop - container.clientHeight / 2 + activeItem.clientHeight / 2
                container.scrollTo({ top: Math.max(0, scrollToPosition), behavior: "smooth" })
            }
        }
    }, [path, openDropdowns])

    const toggleDropdown = (title: string) => {
        setOpenDropdowns(prev => ({ ...prev, [title]: !prev[title] }))
    }

    const CollapsedDropdownItem = ({ item }: { item: DropdownMenuItem }) => {
        const isActiveParent = isDropdownActive(item.children)

        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            tooltip={item.title}
                            className={cn(
                                "transition-all duration-200 hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333]",
                                isActiveParent && "bg-[#e1f9f9] dark:bg-[#1a3333]",
                            )}
                        >
                            <item.icon className="size-4 text-[#68e0df]" />
                            <span className="sr-only">{item.title}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-48">
                        {item.children.map(child => {
                            const isChildActive = path === child.url
                            return (
                                <UIDropdownMenuItem key={child.title} asChild>
                                    <Link
                                        href={child.url}
                                        className={cn(
                                            "flex items-center gap-2 w-full",
                                            isChildActive && "bg-accent text-accent-foreground",
                                        )}
                                    >
                                        <child.icon className="size-4 text-[#68e0df]" />
                                        <span>{child.title}</span>
                                    </Link>
                                </UIDropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        )
    }

    const ExpandedDropdownItem = ({ item }: { item: DropdownMenuItem }) => {
        const isActiveParent = isDropdownActive(item.children)
        const isOpen = openDropdowns[item.title] || false

        return (
            <div key={item.title} className="space-y-1">
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                        <button
                            onClick={() => toggleDropdown(item.title)}
                            className={cn(
                                "flex w-full items-center justify-between transition-all duration-200 hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333]",
                                isActiveParent && "bg-[#e1f9f9] dark:bg-[#1a3333]",
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <item.icon className="size-4 text-[#68e0df]" />
                                <span className="text-gray-600 dark:text-gray-300 group-data-[collapsible=icon]:hidden">
                                    {item.title}
                                </span>
                            </div>
                            <ChevronRight
                                className={cn(
                                    "h-4 w-4 text-gray-500 transition-transform group-data-[collapsible=icon]:hidden",
                                    isOpen && "rotate-90",
                                )}
                            />
                        </button>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                {isOpen && (
                    <div className="pl-6 border-l border-border ml-3 mt-1 space-y-1 group-data-[collapsible=icon]:hidden">
                        {item.children.map(child => {
                            const isChildActive = path === child.url
                            return (
                                <SidebarMenuItem key={child.title}>
                                    <SidebarMenuButton asChild tooltip={child.title}>
                                        <Link
                                            ref={isChildActive ? activeItemRef : null}
                                            className={cn(
                                                "transition-all duration-200 hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333]",
                                                isChildActive && "bg-[#e1f9f9] dark:bg-[#1a3333]",
                                            )}
                                            href={child.url}
                                        >
                                            <child.icon className="size-4 text-[#68e0df]" />
                                            <span className={cn("text-gray-600 dark:text-gray-300", isChildActive && "font-medium")}>
                                                {child.title}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div ref={containerRef} className="h-full overflow-y-auto no-scrollbar">
            {filteredMenuSections.map((section, index) => (
                <SidebarGroup key={index} className="mb-4">
                    <SidebarGroupLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 group-data-[collapsible=icon]:hidden">
                        {section.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {section.items.map(item => {
                            if (!("children" in item) || !item.children) {
                                const isActive = path === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title}>
                                            <Link
                                                ref={isActive ? activeItemRef : null}
                                                className={cn(
                                                    "transition-all duration-200 hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333]",
                                                    isActive && "bg-[#e1f9f9] dark:bg-[#1a3333]",
                                                )}
                                                href={item.url}
                                            >
                                                <item.icon className="size-4 text-[#68e0df]" />
                                                <span className={cn(
                                                    "text-gray-600 dark:text-gray-300 group-data-[collapsible=icon]:hidden",
                                                    isActive && "font-medium",
                                                )}>
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            } else {
                                return isCollapsed ? (
                                    <CollapsedDropdownItem key={item.title} item={item} />
                                ) : (
                                    <ExpandedDropdownItem key={item.title} item={item} />
                                )
                            }
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    )
}