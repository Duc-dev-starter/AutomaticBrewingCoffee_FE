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
    Download,
    Filter,
    RefreshCw,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    PlusCircle,

} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { columns } from "@/components/manage-devices/columns"
import { Device } from "@/types/device"
import ExportButton from "@/components/common/export-button"
import RefreshButton from "@/components/common/refresh-button"


// Tạo dữ liệu mẫu
const generateSampleDevices = (count: number): Device[] => {
    const deviceNames = [
        "Máy pha cà phê tự động A1",
        "Máy pha cà phê tự động B2",
        "Máy pha cà phê tự động C3",
        "Máy pha cà phê tự động D4",
        "Máy pha cà phê tự động E5",
        "Máy pha cà phê tự động F6",
    ]

    const descriptions = [
        "Máy pha cà phê tự động với bộ điều khiển nhiệt độ chính xác",
        "Máy pha cà phê tự động với hệ thống lọc nước tích hợp",
        "Máy pha cà phê tự động với khả năng kết nối WiFi",
        "Máy pha cà phê tự động với màn hình cảm ứng",
        "Máy pha cà phê tự động với hệ thống tự làm sạch",
        "Máy pha cà phê tự động với bộ nhớ công thức",
    ]

    const statuses = ["online", "offline", "maintenance", "error"]

    return Array.from({ length: count }, (_, i) => {
        const now = new Date()
        const randomDays = Math.floor(Math.random() * 365)
        const randomUpdateDays = Math.floor(Math.random() * 30)
        const createdDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
        const hasUpdate = Math.random() > 0.3
        const updatedDate = hasUpdate ? new Date(now.getTime() - randomUpdateDays * 24 * 60 * 60 * 1000) : null

        return {
            deviceId: `DEV-${Math.floor(10000 + Math.random() * 90000)}`,
            name: deviceNames[Math.floor(Math.random() * deviceNames.length)],
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdDate: createdDate.toISOString(),
            updatedDate: updatedDate ? updatedDate.toISOString() : null,
        }
    })
}



const ManageDevices = () => {
    const [loading, setLoading] = React.useState(true)
    const [pageSize, setPageSize] = React.useState(10)

    // Tạo dữ liệu mẫu
    const data = React.useMemo(() => generateSampleDevices(50), [])

    // Giả lập tải dữ liệu
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1500) // Giả lập 1.5 giây tải dữ liệu

        return () => clearTimeout(timer)
    }, [])

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: { pageSize: 10 },
        },
    })

    // Cập nhật kích thước trang khi pageSize thay đổi
    React.useEffect(() => {
        table.setPageSize(pageSize)
    }, [pageSize, table])

    // Tính toán thông tin phân trang
    const totalItems = data.length
    const filteredItems = table.getFilteredRowModel().rows.length
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = Math.ceil(filteredItems / pageSize)
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, filteredItems)

    // Chuyển đổi trạng thái loading (cho mục đích demo)
    const toggleLoading = () => {
        setLoading((prev) => !prev)
    }

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý thiết bị</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả các thiết bị pha cà phê tự động.</p>
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
                            placeholder="Tìm kiếm thiết bị..."
                            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
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
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("online")}>
                                    Hoạt động
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("offline")}>
                                    Không hoạt động
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("maintenance")}>
                                    Bảo trì
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("error")}>
                                    Lỗi
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
                                                {column.id === "deviceId"
                                                    ? "Mã thiết bị"
                                                    : column.id === "name"
                                                        ? "Tên thiết bị"
                                                        : column.id === "description"
                                                            ? "Mô tả"
                                                            : column.id === "status"
                                                                ? "Trạng thái"
                                                                : column.id === "createdDate"
                                                                    ? "Ngày tạo"
                                                                    : column.id === "updatedDate"
                                                                        ? "Ngày cập nhật"
                                                                        : column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button disabled={loading}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
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
                                                {column.id === "deviceId" ? (
                                                    <Skeleton className="h-5 w-24" />
                                                ) : column.id === "name" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-40" />
                                                    </div>
                                                ) : column.id === "description" ? (
                                                    <Skeleton className="h-5 w-64" />
                                                ) : column.id === "status" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full" />
                                                ) : column.id === "createdDate" || column.id === "updatedDate" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-24" />
                                                    </div>
                                                ) : column.id === "actions" ? (
                                                    <div className="flex justify-end">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                    </div>
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

export default ManageDevices
