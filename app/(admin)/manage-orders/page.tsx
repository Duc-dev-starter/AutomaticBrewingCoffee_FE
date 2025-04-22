"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
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
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/hooks/use-debounce";
import { ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { multiSelectFilter } from "@/utils/table";
import type { Order } from "@/interfaces/order";
import { getOrders } from "@/services/order";
import { useToast } from "@/hooks/use-toast";
import { OrderDetailDialog, OrderDialog } from "@/components/dialog/order";
import { columns, FilterBadges, OrderFilter } from "@/components/manage-orders";

const ManageOrders = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [orderTypeFilter, setOrderTypeFilter] = useState<string>("");
    const [paymentGatewayFilter, setPaymentGatewayFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    // Sử dụng useRef để kiểm soát lần mount đầu tiên
    const isInitialMount = useRef(true);

    // Đồng bộ tìm kiếm với columnFilters
    useEffect(() => {
        if (isInitialMount.current) {
            return; // Bỏ qua lần đầu khi mount
        }
        const orderIdColumn = table.getColumn("orderId");
        if (orderIdColumn) {
            orderIdColumn.setFilterValue(debouncedSearchValue || undefined);
        }
    }, [debouncedSearchValue]);

    const fetchOrders = useCallback(async () => {
        console.log("Fetching orders..."); // Để kiểm tra số lần gọi
        try {
            setLoading(true);

            const orderIdFilter = columnFilters.find((f) => f.id === "orderId");
            const filterBy = orderIdFilter ? "orderId" : undefined;
            const filterQuery = orderIdFilter?.value as string | undefined;

            const sortBy = sorting.length > 0 ? sorting[0]?.id : undefined;
            const isAsc = sorting.length > 0 ? !sorting[0]?.desc : undefined;

            const orderTypeFilterValue = orderTypeFilter || undefined;
            const paymentGatewayFilterValue = paymentGatewayFilter || undefined;
            const statusFilterValue = statusFilter || undefined;

            const response = await getOrders({
                filterBy,
                filterQuery,
                page: currentPage,
                size: pageSize,
                sortBy,
                isAsc,
                orderType: orderTypeFilterValue,
                paymentGateway: paymentGatewayFilterValue,
                status: statusFilterValue,
            });

            setOrders(response.items);
            setTotalItems(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error(err);
            toast({ title: "Lỗi", description: "Không thể tải danh sách đơn hàng.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, columnFilters, sorting, toast, orderTypeFilter, paymentGatewayFilter, statusFilter]);

    // Gọi fetchOrders khi mount và khi có thay đổi
    useEffect(() => {
        fetchOrders();
        isInitialMount.current = false;
    }, [fetchOrders]);

    const table = useReactTable({
        data: orders,
        columns: columns((order, action) => {
            if (action === "view") {
                setSelectedOrder(order);
                setDetailDialogOpen(true);
            }
        }),
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
            rowSelection,
            pagination: {
                pageIndex: currentPage - 1,
                pageSize,
            },
        },
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        pageCount: totalPages,
        filterFns: {
            multiSelect: multiSelectFilter,
        },
    });

    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    const clearAllFilters = () => {
        setOrderTypeFilter("");
        setPaymentGatewayFilter("");
        setStatusFilter("");
        setSearchValue("");
        table.resetColumnFilters();
    };

    const hasActiveFilters =
        orderTypeFilter !== "" || paymentGatewayFilter !== "" || statusFilter !== "" || searchValue !== "";

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả các đơn hàng.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={loading} />
                        <RefreshButton loading={loading} toggleLoading={fetchOrders} />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <SearchInput
                            loading={loading}
                            placeHolderText="Tìm kiếm đơn hàng..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <OrderFilter
                            orderTypeFilter={orderTypeFilter}
                            setOrderTypeFilter={setOrderTypeFilter}
                            paymentGatewayFilter={paymentGatewayFilter}
                            setPaymentGatewayFilter={setPaymentGatewayFilter}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            clearAllFilters={clearAllFilters}
                            hasActiveFilters={hasActiveFilters}
                            loading={loading}
                        />
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
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={() => column.toggleVisibility(!column.getIsVisible())}
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
                        <Button onClick={() => setEditDialogOpen(true)} disabled={loading}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                    </div>
                </div>

                <FilterBadges
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    orderTypeFilter={orderTypeFilter}
                    setOrderTypeFilter={setOrderTypeFilter}
                    paymentGatewayFilter={paymentGatewayFilter}
                    setPaymentGatewayFilter={setPaymentGatewayFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    hasActiveFilters={hasActiveFilters}
                />

                <div className="rounded-md border">
                    <Table>
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
                            {loading ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                                        {columns(() => { }).map((column, cellIndex) => (
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
                            ) : orders.length ? (
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
                                <NoResultsRow columns={columns(() => { })} />
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination
                    loading={loading}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={totalItems}
                    totalPages={totalPages}
                />
            </div>
            <OrderDetailDialog
                order={selectedOrder}
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open);
                    if (!open) setSelectedOrder(null);
                }}
            />
            <OrderDialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setSelectedOrder(null);
                }}
                onSuccess={fetchOrders}
            />
        </div>
    );
};

export default ManageOrders;