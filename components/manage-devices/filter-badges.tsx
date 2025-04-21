"use client"
import { X } from "lucide-react";
import { Badge } from "../ui/badge";

type FilterBadgesProps = {
    searchValue: string
    setSearchValue: (value: string) => void
    orderTypeFilter?: string
    setOrderTypeFilter?: (value: string) => void
    paymentGatewayFilter?: string
    setPaymentGatewayFilter?: (value: string) => void
    statusFilter: string
    setStatusFilter: (value: string) => void
    hasActiveFilters: boolean
}

export const FilterBadges = ({
    searchValue,
    setSearchValue,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
}: FilterBadgesProps) => {
    if (!hasActiveFilters) return null;

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
                    <span>Trạng thái: {statusFilter}</span>
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("")} />
                </Badge>
            )}
        </div>
    );
};