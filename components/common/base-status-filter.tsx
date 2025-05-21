"use client"

import { ChevronDownIcon, Filter, Check } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import type { FilterProps } from "@/types/filter"
import { cn } from "@/lib/utils"

// Status color mapping
const statusColorMap = {
    [EBaseStatus.Active]: "bg-primary",
    [EBaseStatus.Inactive]: "bg-gray-400",
}

export const BaseStatusFilter = ({ statusFilter, setStatusFilter }: FilterProps) => {
    const statuses = Object.values(EBaseStatus)
    const totalStatuses = statuses.length
    const activeCount = statusFilter ? 1 : 0

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                    {statusFilter ? (
                        <span className={cn("w-2 h-2 rounded-full mr-2", statusColorMap[statusFilter as EBaseStatus])} />
                    ) : (
                        <Filter className="mr-2 h-4 w-4" />
                    )}
                    Trạng thái <span className="ml-1 bg-gray-200 rounded-full px-2 pt-0.5 pb-1 text-xs">
                        {activeCount}/{totalStatuses}
                    </span>

                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    {statuses.map((status) => (
                        <DropdownMenuRadioItem
                            key={status}
                            value={status}
                            className={cn(
                                "group relative flex items-center cursor-pointer",
                                statusFilter === status && status === EBaseStatus.Active && "text-primary",
                                "hover:bg-muted hover:text-primary",
                                status === EBaseStatus.Active && "data-[state=checked]:text-primary"
                            )}
                        >
                            <span className="text-black">{EBaseStatusViMap[status as EBaseStatus]}</span>
                            {statusFilter === status && (
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4 text-muted-foreground"
                                    )}
                                />
                            )}
                        </DropdownMenuRadioItem>

                    ))}
                </DropdownMenuRadioGroup>

                {statusFilter && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setStatusFilter("")}
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}   