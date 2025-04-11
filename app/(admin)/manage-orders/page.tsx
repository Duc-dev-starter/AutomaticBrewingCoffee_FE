"use client"

import * as React from "react"
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
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { filterFns } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton"
import { Transaction } from "@/types"
import columns from "@/components/manage-customer/columns"
import RefreshButton from "@/components/common/refresh-button"
import ExportButton from "@/components/common/export-button"



// Generate sample data
const generateSampleData = (count: number): Transaction[] => {
    const waterTypes = ["Nước tinh khiết", "Nước khoáng", "Nước kiềm", "Nước suối"]
    const paymentMethods = ["Thẻ tín dụng", "Tiền mặt", "Thanh toán di động", "Thẻ trả trước"]
    const statuses: ("completed" | "pending" | "failed")[] = ["completed", "pending", "failed"]

    return Array.from({ length: count }, (_, i) => {
        const now = new Date()
        const randomDays = Math.floor(Math.random() * 30)
        const randomHours = Math.floor(Math.random() * 24)
        const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000 - randomHours * 60 * 60 * 1000)

        return {
            id: `GD-${Math.floor(10000 + Math.random() * 90000)}`,
            date,
            amount: Math.round((Math.random() * 50 + 5) * 1000) / 100,
            name: waterTypes[Math.floor(Math.random() * waterTypes.length)],
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
        }
    })
}



const ManageCustomers = () => {
    const [loading, setLoading] = React.useState(true)
    const [pageSize, setPageSize] = React.useState(10)

    // Generate 100 sample transactions
    const data = React.useMemo(() => generateSampleData(100), [])

    // Simulate loading data
    React.useEffect(() => {
        // In a real application, this would be replaced with actual data fetching
        const timer = setTimeout(() => {
            setLoading(false)
        }, 3000) // Simulate 3 seconds loading time

        return () => clearTimeout(timer)
    }, [])


    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})


    const table = useReactTable({
        data,
        columns,
        filterFns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10 },
        },
    });


    // Update table page size when pageSize state changes
    React.useEffect(() => {
        table.setPageSize(pageSize)
    }, [pageSize, table])

    // Calculate pagination information
    const totalItems = data.length
    const filteredItems = table.getFilteredRowModel().rows.length
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = Math.ceil(filteredItems / pageSize)
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, filteredItems)

    // For demo purposes - toggle loading state
    const toggleLoading = () => {
        setLoading((prev) => !prev)
    }


    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Giao dịch khách hàng ẩn danh</h2>
                        <p className="text-muted-foreground">Quản lý và xem tất cả giao dịch mua nước từ máy thanh toán tự động.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={loading} />
                        <RefreshButton loading={loading} toggleLoading={toggleLoading} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm giao dịch..."
                            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn("id")?.setFilterValue(event.target.value)}
                            className="pl-8"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto" disabled={loading}>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Lọc
                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("completed")}>
                                    Hoàn thành
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("pending")}>
                                    Đang xử lý
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("failed")}>
                                    Thất bại
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("")}>
                                    Xóa bộ lọc
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={loading}>
                                    Cột <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id === "id"
                                                    ? "Mã giao dịch"
                                                    : column.id === "date"
                                                        ? "Ngày giờ"
                                                        : column.id === "amount"
                                                            ? "Số tiền"
                                                            : column.id === "waterType"
                                                                ? "Loại nước"
                                                                : column.id === "paymentMethod"
                                                                    ? "Phương thức thanh toán"
                                                                    : column.id === "status"
                                                                        ? "Trạng thái"
                                                                        : column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                // Skeleton loading state
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                                        {columns.map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "id" ? (
                                                    <Skeleton className="h-5 w-24" />
                                                ) : column.id === "date" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-20" />
                                                        <Skeleton className="h-4 w-4 rounded-full ml-2" />
                                                        <Skeleton className="h-5 w-16" />
                                                    </div>
                                                ) : column.id === "amount" ? (
                                                    <Skeleton className="h-5 w-24" />
                                                ) : column.id === "waterType" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-28" />
                                                    </div>
                                                ) : column.id === "paymentMethod" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-32" />
                                                    </div>
                                                ) : column.id === "status" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full" />
                                                ) : column.id === "actions" ? (
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                ) : (
                                                    <Skeleton className="h-5 w-full" />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Không có kết quả.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 py-4">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Hiển thị</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                setPageSize(Number(value))
                            }}
                            disabled={loading}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 20, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm font-medium">mục mỗi trang</p>
                    </div>

                    {loading ? (
                        <Skeleton className="h-5 w-64" />
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Đang hiển thị {filteredItems > 0 ? startItem : 0} đến {endItem} trong tổng số {filteredItems} mục
                            {filteredItems !== totalItems && ` (đã lọc từ ${totalItems} mục)`}
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage() || loading}
                        >
                            <span className="sr-only">Trang đầu</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || loading}
                        >
                            <span className="sr-only">Trang trước</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {loading ? (
                            <Skeleton className="h-5 w-16" />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium">Trang {currentPage}</span>
                                <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || loading}
                        >
                            <span className="sr-only">Trang sau</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage() || loading}
                        >
                            <span className="sr-only">Trang cuối</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageCustomers

