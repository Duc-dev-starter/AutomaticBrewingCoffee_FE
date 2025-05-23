"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EOrderStatusViMap, EOrderTypeViMap, EPaymentGatewayViMap } from "@/enum/order"
import { FilterBadgesProps } from "@/types/filter"


export const FilterBadges = ({
  searchValue,
  setSearchValue,
  statusFilter,
  setStatusFilter,
  hasActiveFilters,
}: FilterBadgesProps) => {
  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {searchValue && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
          <span>Tìm kiếm: {searchValue}</span>
          <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchValue("")} />
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
