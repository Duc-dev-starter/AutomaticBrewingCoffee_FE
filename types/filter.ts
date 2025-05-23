export type FilterProps = {
    statusFilter: string
    setStatusFilter: (value: string) => void
    clearAllFilters: () => void
    hasActiveFilters: boolean
    loading: boolean
}

export type ProductFilterProps = FilterProps & {
    productTypeFilter: string
    setProductTypeFilter: (value: string) => void
    productSizeFilter: string
    setProductSizeFilter: (value: string) => void
}



export type FilterBadgesProps = {
    searchValue: string
    setSearchValue: (value: string) => void
    statusFilter: string
    setStatusFilter: (value: string) => void
    hasActiveFilters: boolean
}

export type ProductFilterBadgesProps = FilterBadgesProps & {
    productTypeFilter: string
    setProductTypeFilter: (value: string) => void
    productSizeFilter: string
    setProductSizeFilter: (value: string) => void
}
