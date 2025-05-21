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

export function AdminSidebar() {
    const [user, setUser] = React.useState<any>(null)

    React.useEffect(() => {
        const userStr = Cookies.get("user")
        if (userStr) {
            try {
                setUser(JSON.parse(userStr))
            } catch (err) {
                console.error("Error parsing user cookie:", err)
            }
        }
    }, [])

    return (
        <Sidebar collapsible="icon" className="bg-white dark:bg-[#121212]">
            <SidebarHeader className="py-4 bg-primary-100" >
                <Link
                    href={Path.DASHBOARD}
                    className={clsx(
                        "flex items-center px-4 transition-all",
                        "group-data-[collapsible=icon]:px-0",
                        "group-data-[collapsible=icon]:justify-center",
                    )}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#68e0df] text-white">
                        <Coffee className="h-6 w-6" />
                    </div>
                    <span className="ml-3 text-lg font-medium text-gray-700 dark:text-white group-data-[collapsible=icon]:hidden">
                        AI Cofi
                    </span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
            </SidebarContent>
            <SidebarFooter className="py-2">{user && <NavUser user={user} />}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
