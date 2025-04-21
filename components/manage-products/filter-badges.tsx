"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductFilterBadgesProps } from "@/types/filter";
import { EProductSizeViMap, EProductStatusViMap, EProductTypeViMap } from "@/enum/product";

export const FilterBadges = ({
    searchValue,
    setSearchValue,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    productTypeFilter,
    setProductTypeFilter,
    productSizeFilter,
    setProductSizeFilter,
}: ProductFilterBadgesProps) => {
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
                    <span>Trạng thái: {EProductStatusViMap[statusFilter]}</span>
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("")} />
                </Badge>
            )}
            {productTypeFilter && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    <span>Loại: {EProductTypeViMap[productTypeFilter]}</span>
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setProductTypeFilter("")} />
                </Badge>
            )}
            {productSizeFilter && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    <span>Size: {EProductSizeViMap[productSizeFilter]}</span>
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setProductSizeFilter("")} />
                </Badge>
            )}
        </div>
    );
};  