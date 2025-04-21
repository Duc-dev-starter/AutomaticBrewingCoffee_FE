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
import { ProductFilterProps } from "@/types/filter"
import { EProductSize, EProductSizeViMap, EProductStatus, EProductStatusViMap, EProductType, EProductTypeViMap } from "@/enum/product"


export const ProductFilter = ({
    statusFilter,
    setStatusFilter,
    clearAllFilters,
    hasActiveFilters,
    loading,
    productTypeFilter,
    setProductTypeFilter,
    productSizeFilter,
    setProductSizeFilter,
}: ProductFilterProps) => {
    const statuses = Object.values(EProductStatus);
    const types = Object.values(EProductType);
    const sizes = Object.values(EProductSize);

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
                            {EProductStatusViMap[status as EProductStatus]}
                        </DropdownMenuRadioItem>
                    ))}
                    {statusFilter && (
                        <DropdownMenuRadioItem value="">
                            Xóa bộ lọc trạng thái
                        </DropdownMenuRadioItem>
                    )}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Lọc theo loại</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={productTypeFilter} onValueChange={setProductTypeFilter}>
                    {types.map((status) => (
                        <DropdownMenuRadioItem key={status} value={status}>
                            {EProductTypeViMap[status as EProductType]}
                        </DropdownMenuRadioItem>
                    ))}
                    {productTypeFilter && (
                        <DropdownMenuRadioItem value="">
                            Xóa bộ lọc loại
                        </DropdownMenuRadioItem>
                    )}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Lọc theo size</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={productSizeFilter} onValueChange={setProductSizeFilter}>
                    {sizes.map((status) => (
                        <DropdownMenuRadioItem key={status} value={status}>
                            {EProductSizeViMap[status as EProductSize]}
                        </DropdownMenuRadioItem>
                    ))}
                    {productSizeFilter && (
                        <DropdownMenuRadioItem value="">
                            Xóa bộ lọc size
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