"use client"

import * as React from "react"
import Cookies from "js-cookie"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import Link from "next/link"
import { Coffee } from "lucide-react"
import { Path } from "@/constants/path"
import clsx from "clsx"
import { useAppStore } from "@/stores/use-app-store"

export function AdminSidebar() {
    const account = useAppStore(state => state.account);
    console.log(account)
    const roleName = account?.roleName


    return (
        <Sidebar collapsible="icon" className="bg-white dark:bg-[#121212]">
            <SidebarHeader className="py-4 " >
                <Link
                    href={Path.DASHBOARD}
                    className={clsx(
                        "flex items-center px-4 transition-all",
                        "group-data-[collapsible=icon]:px-0",
                        "group-data-[collapsible=icon]:justify-center",
                    )}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
                        <Coffee className="h-6 w-6" />
                    </div>
                    <span className="ml-3 text-lg font-medium text-gray-700 dark:text-white group-data-[collapsible=icon]:hidden">
                        CUPX
                    </span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain roleName={roleName} />
            </SidebarContent>
            <SidebarFooter className="py-2">{account && <NavUser account={account} />}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
