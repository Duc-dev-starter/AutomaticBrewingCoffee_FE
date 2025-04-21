"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EOrderStatusViMap, EOrderTypeViMap, EPaymentGatewayViMap } from "@/enum/order"
import { OrderFilterBadgesProps } from "@/types/filter"


export const FilterBadges = ({
  searchValue,
  setSearchValue,
  orderTypeFilter,
  setOrderTypeFilter,
  paymentGatewayFilter,
  setPaymentGatewayFilter,
  statusFilter,
  setStatusFilter,
  hasActiveFilters,
}: OrderFilterBadgesProps) => {
  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {searchValue && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
          <span>Tìm kiếm: {searchValue}</span>
          <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchValue("")} />
        </Badge>
      )}
      {orderTypeFilter && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
          <span>Loại đơn hàng: {EOrderTypeViMap[orderTypeFilter]}</span>
          <X className="h-3 w-3 cursor-pointer" onClick={() => setOrderTypeFilter("")} />
        </Badge>
      )}
      {paymentGatewayFilter && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
          <span>Phương thức thanh toán: {EPaymentGatewayViMap[paymentGatewayFilter]}</span>
          <X className="h-3 w-3 cursor-pointer" onClick={() => setPaymentGatewayFilter("")} />
        </Badge>
      )}
      {statusFilter && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
          <span>Trạng thái: {EOrderStatusViMap[statusFilter]}</span>
          <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("")} />
        </Badge>
      )}
    </div>
  )
}
