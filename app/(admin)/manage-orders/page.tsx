"use client"

import React, { useCallback, useEffect, useState, useMemo } from "react"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import {
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common"
import { multiSelectFilter } from "@/utils/table"
import { useDebounce, useToast } from "@/hooks"
import { useOrders } from "@/hooks/use-orders"
import { OrderDetailDialog, OrderRefundDialog } from "@/components/dialog/order"
import { columns, OrderFilter } from "@/components/manage-orders"
import { Order } from "@/interfaces/order"

const ManageOrders = () => {
    const { toast } = useToast()
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [refundDialogOpen, setRefundDialogOpen] = useState(false)
    const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null)

    const [searchValue, setSearchValue] = useState("")
    const debouncedSearchValue = useDebounce(searchValue, 500)

    const params = {
        filterBy: debouncedSearchValue ? "orderId" : undefined,
        filterQuery: debouncedSearchValue || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: sorting.length > 0 ? sorting[0]?.id : undefined,
        isAsc: sorting.length > 0 ? !sorting[0]?.desc : undefined,
        status: statusFilter || undefined,
    }

    const hasActiveFilters = statusFilter !== "" || searchValue !== ""

    const { data, error, isLoading, mutate } = useOrders(params)

    useEffect(() => {
        if (error) {
            toast({
                title: "Lỗi khi lấy danh sách đơn hàng",
                description: error.message || "Đã xảy ra lỗi không xác định",
                variant: "destructive",
            })
        }
    }, [error, toast])

    const handleRefund = useCallback((order: Order) => {
        setSelectedOrderForRefund(order)
        setRefundDialogOpen(true)
    }, [])

    const handleViewDetails = useCallback((order: Order) => {
        setSelectedOrder(order)
        setDetailDialogOpen(true)
    }, [])

    const clearAllFilters = () => {
        setStatusFilter("")
        setSearchValue("")
        table.resetColumnFilters()
    }

    const columnsDef = useMemo(
        () => columns({
            onViewDetails: handleViewDetails,
            onRefund: handleRefund,
        }),
        [handleViewDetails, handleRefund]
    )

    const table = useReactTable({
        data: data?.items || [],
        columns: columnsDef,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination: { pageIndex: currentPage - 1, pageSize },
        },
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        pageCount: data?.totalPages || 1,
        filterFns: { multiSelect: multiSelectFilter },
    })

    useEffect(() => {
        table.setPageSize(pageSize)
    }, [pageSize, table])

    useEffect(() => {
        setCurrentPage(1)
    }, [columnFilters])

    const visibleCount = useMemo(
        () => table.getAllColumns().filter((col) => col.getIsVisible()).length,
        [table.getState().columnVisibility]
    )

    const totalCount = useMemo(() => table.getAllColumns().length, [])

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả các đơn hàng.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={isLoading} />
                        <RefreshButton loading={isLoading} toggleLoading={mutate} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <SearchInput
                            loading={isLoading}
                            placeHolderText="Tìm kiếm đơn hàng..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <OrderFilter
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            clearAllFilters={clearAllFilters}
                            hasActiveFilters={hasActiveFilters}
                            loading={isLoading}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Cột <span className="bg-gray-200 rounded-full px-2 pt-0.5 pb-1 text-xs">
                                        {visibleCount}/{totalCount}
                                    </span> <ChevronDownIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id === "orderId"
                                                ? "Mã đơn hàng"
                                                : column.id === "status"
                                                    ? "Trạng thái"
                                                    : column.id === "totalAmount"
                                                        ? "Tổng số tiền"
                                                        : column.id === "orderType"
                                                            ? "Loại đơn hàng"
                                                            : column.id === "paymentGateway"
                                                                ? "Phương thức thanh toán"
                                                                : column.id === "actions"
                                                                    ? "Hành động"
                                                                    : column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table className="table-fixed">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-center">
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted()
                                                        ? header.column.getIsSorted() === "asc"
                                                            ? " ↑"
                                                            : " ↓"
                                                        : null}
                                                </Button>
                                            ) : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {(!data && isLoading) ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                                        {columns({ onViewDetails: () => { }, onRefund: () => { } }).map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "orderId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "status" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "totalAmount" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "orderType" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "paymentGateway" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "actions" ? (
                                                    <div className="flex justify-center">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                    </div>
                                                ) : (
                                                    <Skeleton className="h-5 w-full" />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : data?.items?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <NoResultsRow columns={columns({ onViewDetails: () => { }, onRefund: () => { } })} />
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination
                    loading={isLoading}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={data?.total || 0}
                    totalPages={data?.totalPages || 1}
                />
            </div>
            <OrderDetailDialog
                order={selectedOrder}
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open)
                    if (!open) setSelectedOrder(null)
                }}
            />
            {selectedOrderForRefund && (
                <OrderRefundDialog
                    order={selectedOrderForRefund}
                    open={refundDialogOpen}
                    onOpenChange={(open) => {
                        setRefundDialogOpen(open)
                        if (!open) setSelectedOrderForRefund(null)
                    }}
                />
            )}
        </div>
    )
}

export default ManageOrders