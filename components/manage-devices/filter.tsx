"use client"

import { ChevronDownIcon, Filter } from "lucide-react"
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

type FilterProps = {
    orderTypeFilter?: string
    setOrderTypeFilter?: (value: string) => void
    paymentGatewayFilter?: string
    setPaymentGatewayFilter?: (value: string) => void
    statusFilter: string
    setStatusFilter: (value: string) => void
    clearAllFilters: () => void
    hasActiveFilters: boolean
    loading: boolean
}

export const DeviceFilter = ({
    statusFilter,
    setStatusFilter,
    clearAllFilters,
    hasActiveFilters,
    loading,
}: FilterProps) => {
    const statuses = Object.values(EDeviceStatus);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto" disabled={loading}>
                    <Filter className="mr-2 h-4 w-4" />
                    Lọc
                    {hasActiveFilters && (
                        <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">!</span>
                    )}
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    {statuses.map((status) => (
                        <DropdownMenuRadioItem key={status} value={status}>
                            {EDeviceStatusViMap[status as EDeviceStatus]}
                        </DropdownMenuRadioItem>
                    ))}
                    {statusFilter && (
                        <DropdownMenuRadioItem value="">
                            Xóa bộ lọc trạng thái
                        </DropdownMenuRadioItem>
                    )}
                </DropdownMenuRadioGroup>

                {hasActiveFilters && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={clearAllFilters}
                            >
                                Xóa tất cả bộ lọc
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};