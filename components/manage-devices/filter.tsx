"use client"

import { Check, ChevronDownIcon, Filter } from "lucide-react"
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
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device"
import { FilterProps } from "@/types/filter"
import { cn } from "@/lib/utils"

const statusStyleMap: Record<EDeviceStatus, { dot: string; text: string }> = {
    [EDeviceStatus.Maintain]: {
        dot: "bg-yellow-500",
        text: "text-yellow-500",
    },
    [EDeviceStatus.Stock]: {
        dot: "bg-primary",
        text: "text-primary",
    },
    [EDeviceStatus.Working]: {
        dot: "bg-green-500",
        text: "text-green-500",
    },
}

const fallbackLabel = "Không rõ"
const fallbackStyle = {
    dot: "bg-gray-400",
    text: "text-muted-foreground",
}

export const DeviceFilter = ({ statusFilter, setStatusFilter }: FilterProps) => {
    const statuses = Object.values(EDeviceStatus)
    const totalStatuses = statuses.length
    const activeCount = statusFilter ? 1 : 0

    const isKnownStatus =
        statusFilter && statuses.includes(statusFilter as EDeviceStatus)

    const displayStyle = isKnownStatus
        ? statusStyleMap[statusFilter as EDeviceStatus]
        : fallbackStyle

    const displayLabel = isKnownStatus
        ? EDeviceStatusViMap[statusFilter as EDeviceStatus]
        : fallbackLabel

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                    {statusFilter ? (
                        <>
                            <span
                                className={cn(
                                    "w-2 h-2 rounded-full mr-2",
                                    displayStyle.dot
                                )}
                            />
                            <span className={cn(displayStyle.text)}>{displayLabel}</span>
                        </>
                    ) : (
                        <>
                            <Filter className="mr-2 h-4 w-4" />
                            Trạng thái
                        </>
                    )}
                    <span className="ml-1 bg-gray-200 rounded-full px-2 pt-0.5 pb-1 text-xs">
                        {activeCount}/{totalStatuses}
                    </span>
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                >
                    {statuses.map((status) => (
                        <DropdownMenuRadioItem
                            key={status}
                            value={status}
                            className={cn(
                                "group relative flex items-center cursor-pointer",
                                statusFilter === status && statusStyleMap[status]?.text,
                                "hover:bg-muted hover:text-primary",
                                status === EDeviceStatus.Stock && "data-[state=checked]:text-primary",
                                status === EDeviceStatus.Maintain && "data-[state=checked]:text-yellow-500",
                                status === EDeviceStatus.Working && "data-[state=checked]:text-green-500",
                            )}
                        >
                            <span className="text-black">
                                {EDeviceStatusViMap[status as EDeviceStatus]}
                            </span>
                            {statusFilter === status && (
                                <Check className="ml-auto h-4 w-4 text-muted-foreground" />
                            )}
                        </DropdownMenuRadioItem>
                    ))}
                    {!isKnownStatus && statusFilter && (
                        <DropdownMenuRadioItem
                            value={statusFilter}
                            className={cn(
                                "group relative flex items-center cursor-pointer",
                                fallbackStyle.text,
                                "hover:bg-muted hover:text-yellow-600"
                            )}
                        >
                            <span className="text-black">{fallbackLabel}</span>
                            <Check className="ml-auto h-4 w-4 text-muted-foreground" />
                        </DropdownMenuRadioItem>
                    )}
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
