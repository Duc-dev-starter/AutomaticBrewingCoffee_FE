"use client"

import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { EBaseStatusViMap } from "@/enum/base"
import type { FilterBadgesProps } from "@/types/filter"

export const BaseFilterBadges = ({
    searchValue,
    statusFilter,
    setSearchValue,
    setStatusFilter,
    hasActiveFilters,
}: FilterBadgesProps) => {
    if (!hasActiveFilters) return null

    return (
        <div className="flex gap-2 flex-wrap">
            {searchValue && (
                <Badge className="px-3 py-1 bg-primary-100 text-primary-500 border-primary-200 hover:bg-primary-200 transition-colors">
                    Tìm kiếm: {searchValue}
                    <X
                        className="ml-2 h-4 w-4 cursor-pointer hover:text-primary-400 transition-colors"
                        onClick={() => setSearchValue("")}
                    />
                </Badge>
            )}
            {statusFilter && (
                <Badge className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-500 border-primary-200 hover:bg-primary-200 transition-colors">
                    <span>Trạng thái: {EBaseStatusViMap[statusFilter]}</span>
                    <X
                        className="h-3 w-3 cursor-pointer hover:text-primary-400 transition-colors"
                        onClick={() => setStatusFilter("")}
                    />
                </Badge>
            )}
        </div>
    )
}
