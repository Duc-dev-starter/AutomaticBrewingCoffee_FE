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
import {
    EOrderStatus,
    EOrderStatusViMap,
    EOrderType,
    EOrderTypeViMap,
    EPaymentGateway,
    EPaymentGatewayViMap,
} from "@/enum/order"

interface OrderFilterProps {
    orderTypeFilter: string
    setOrderTypeFilter: (value: string) => void
    paymentGatewayFilter: string
    setPaymentGatewayFilter: (value: string) => void
    statusFilter: string
    setStatusFilter: (value: string) => void
    clearAllFilters: () => void
    hasActiveFilters: boolean
    loading: boolean
}

export const OrderFilter = ({
    orderTypeFilter,
    setOrderTypeFilter,
    paymentGatewayFilter,
    setPaymentGatewayFilter,
    statusFilter,
    setStatusFilter,
    clearAllFilters,
    hasActiveFilters,
    loading,
}: OrderFilterProps) => {
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
                {/* Bộ lọc loại đơn hàng */}
                <DropdownMenuLabel>Lọc theo loại đơn hàng</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                    {Object.values(EOrderType).map((type) => (
                        <DropdownMenuRadioItem key={type} value={type}>
                            {EOrderTypeViMap[type]}
                        </DropdownMenuRadioItem>
                    ))}
                    {orderTypeFilter && <DropdownMenuRadioItem value="">Xóa bộ lọc loại đơn hàng</DropdownMenuRadioItem>}
                </DropdownMenuRadioGroup>

                {/* Bộ lọc phương thức thanh toán */}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Lọc theo phương thức thanh toán</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={paymentGatewayFilter} onValueChange={setPaymentGatewayFilter}>
                    {Object.values(EPaymentGateway).map((gateway) => (
                        <DropdownMenuRadioItem key={gateway} value={gateway}>
                            {EPaymentGatewayViMap[gateway]}
                        </DropdownMenuRadioItem>
                    ))}
                    {paymentGatewayFilter && (
                        <DropdownMenuRadioItem value="">Xóa bộ lọc phương thức thanh toán</DropdownMenuRadioItem>
                    )}
                </DropdownMenuRadioGroup>

                {/* Bộ lọc trạng thái */}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    {Object.values(EOrderStatus).map((status) => (
                        <DropdownMenuRadioItem key={status} value={status}>
                            {EOrderStatusViMap[status]}
                        </DropdownMenuRadioItem>
                    ))}
                    {statusFilter && <DropdownMenuRadioItem value="">Xóa bộ lọc trạng thái</DropdownMenuRadioItem>}
                </DropdownMenuRadioGroup>

                {/* Nút xóa tất cả bộ lọc */}
                {hasActiveFilters && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                            <Button variant="destructive" size="sm" className="w-full" onClick={clearAllFilters}>
                                Xóa tất cả bộ lọc
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
