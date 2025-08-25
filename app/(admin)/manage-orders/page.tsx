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
import Cookies from "js-cookie"
import axios from "axios"
import { ErrorResponse } from "@/types/error"
import { DateRange } from "react-day-picker"
import { Download } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { vi } from "date-fns/locale"


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

    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

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
        setDateRange(undefined)
    }

    const handleExport = async () => {
        try {
            const token = Cookies.get('accessToken')
            const headers: any = {
                'accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const exportParams: any = {};
            if (dateRange?.from) {
                exportParams.startDate = dateRange.from.toISOString();
            }
            if (dateRange?.to) {
                exportParams.endDate = dateRange.to.toISOString();
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/export`,
                {
                    responseType: 'blob',
                    headers: headers,
                    params: exportParams
                }
            )

            const contentType = response.headers['content-type'];
            if (contentType.includes('spreadsheetml.sheet') || contentType.includes('vnd.ms-excel')) {

                const blob = new Blob([response.data], { type: contentType })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url

                const fromDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : 'start';
                const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : 'end';
                link.download = `orders_${fromDate}_to_${toDate}.xlsx`

                link.click()
                window.URL.revokeObjectURL(url)
                toast({
                    title: "Thành công",
                    description: "Tải file Excel thành công!",
                })
            } else {
                throw new Error("Server không trả về file Excel")
            }
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Error exporting orders:", error)
            toast({
                title: "Lỗi",
                description: err.message || "Xuất dữ liệu thất bại",
                variant: "destructive",
            })
        }
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
                        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    effect="shineHover"
                                    className="h-10 px-4 flex items-center"
                                >
                                    <Download className="mr-2 h-5 w-5" />
                                    Xuất dữ liệu
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                    <DialogTitle>Xuất dữ liệu đơn hàng</DialogTitle>
                                    <DialogDescription>
                                        Chọn khoảng thời gian bạn muốn xuất file Excel. Để trống nếu muốn xuất tất cả.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <div className="flex justify-center">
                                        <Calendar
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            className="rounded-md border"
                                            numberOfMonths={2}
                                            locale={vi}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Hủy</Button>
                                    </DialogClose>
                                    <Button onClick={handleExport} disabled={isLoading}>
                                        {isLoading ? "Đang xuất..." : "Xác nhận & Xuất file"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

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
                                            {column.id === "orderCode"
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
                                                {column.id === "orderCode" ? (
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