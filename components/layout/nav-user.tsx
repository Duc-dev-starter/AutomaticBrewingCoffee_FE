"use client"

import { BadgeCheck, Bell, ChevronsUpDown, LogOut, Sparkles, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import Link from "next/link"
import { Path } from "@/constants/path.constant"
import { ThemeSelector } from "./theme-selector"
import { logout } from "@/services/auth.service"
import { Account } from "@/interfaces/account"
import { useAppStore } from "@/stores/use-app-store"
import { useRouter } from "next/navigation"

export function NavUser({
    account,
}: {
    account: Account | null
}) {
    const { isMobile } = useSidebar()
    const router = useRouter();
    const handleLogout = async () => {
        logout();
        useAppStore.getState().clearAccount();
        router.push(Path.LOGIN);
    };

    if (account === null) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" disabled>
                        <div className="animate-pulse flex items-center gap-2 w-full">
                            <div className="h-8 w-8 bg-gray-300 rounded-lg" />
                            <div className="flex flex-col flex-1 space-y-1 group-data-[collapsible=icon]:hidden">
                                <div className="h-3 w-3/4 bg-gray-300 rounded" />
                                <div className="h-2 w-1/2 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333]">
                            <Avatar className="h-9 w-9 rounded-md border border-[#e1f9f9] bg-[#e1f9f9] text-[#68e0df] dark:border-[#1a3333] dark:bg-[#1a3333]">
                                <AvatarImage src={"/avatars/shadcn.jpg"} alt={account.fullName} />
                                <AvatarFallback className="rounded-md text-sm font-medium">{account.fullName}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-medium text-gray-700 dark:text-gray-300">{account.fullName}</span>
                                <span className="truncate text-xs text-gray-500 dark:text-gray-400">{account.roleName}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-[#68e0df] group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <Link href={Path.PROFILE}>
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] rounded-md transition-colors duration-200">
                                    <Avatar className="h-9 w-9 rounded-md border border-[#e1f9f9] bg-[#e1f9f9] text-[#68e0df] dark:border-[#1a3333] dark:bg-[#1a3333]">
                                        <AvatarImage src={"/avatars/shadcn.jpg"} alt={account.fullName} />
                                        <AvatarFallback className="rounded-md text-sm font-medium">
                                            {account.fullName}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{account.fullName}</span>
                                        <span className="truncate text-xs text-gray-500 dark:text-gray-400">{account.roleName}</span>
                                    </div>
                                </div>
                            </Link>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <Link href={Path.PROFILE}>
                                <DropdownMenuItem className="hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] focus:bg-[#e1f9f9] dark:focus:bg-[#1a3333]">
                                    <User className="mr-2 h-4 w-4 text-[#68e0df]" />
                                    Hồ sơ cá nhân
                                </DropdownMenuItem>
                            </Link>
                            <Link href={Path.REMINDER}>
                                <DropdownMenuItem className="hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] focus:bg-[#e1f9f9] dark:focus:bg-[#1a3333]">
                                    <Sparkles className="mr-2 h-4 w-4 text-[#68e0df]" />
                                    Ghi chú
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] focus:bg-[#e1f9f9] dark:focus:bg-[#1a3333]">
                                <BadgeCheck className="mr-2 h-4 w-4 text-[#68e0df]" />
                                Tài khoản
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] focus:bg-[#e1f9f9] dark:focus:bg-[#1a3333]">
                                <Bell className="mr-2 h-4 w-4 text-[#68e0df]" />
                                Thông báo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="hover:bg-[#e1f9f9] dark:hover:bg-[#1a3333] focus:bg-[#e1f9f9] dark:focus:bg-[#1a3333]">
                                <ThemeSelector />
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20">
                            <LogOut className="mr-2 h-4 w-4 text-red-500" />
                            <p className="text-red-600 dark:text-red-400">Đăng xuất</p>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
