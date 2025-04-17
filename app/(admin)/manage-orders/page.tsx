"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    PlusCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "@/components/manage-orders/columns";
import useDebounce from "@/hooks/use-debounce";
import { ExportButton, NoResultsRow, PageSizeSelector, RefreshButton, SearchInput } from "@/components/common";
import { multiSelectFilter } from "@/utils/table";
import { Order } from "@/interfaces/order";
import { getOrders, deleteOrder } from "@/services/order";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderDetailDialog, OrderDialog } from "@/components/dialog/order"

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

    // Dialog state
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Search state
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    // Update columnFilters for orderId
    useEffect(() => {
        table.getColumn("orderId")?.setFilterValue(debouncedSearchValue || undefined);
    }, [debouncedSearchValue]);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const filterBy = columnFilters.find((f) => f.id === "orderId")?.id || undefined;
            const filterQuery = columnFilters.find((f) => f.id === "orderId")?.value as string | undefined;
            const sortBy = sorting.length > 0 ? sorting[0]?.id : undefined;
            const isAsc = sorting.length > 0 ? !sorting[0]?.desc : undefined;
            const statusFilter = columnFilters.find((filter) => filter.id === "status")?.value as string | undefined;

            const response = await getOrders({
                filterBy,
                filterQuery,
                page: currentPage,
                size: pageSize,
                sortBy,
                isAsc,
                status: statusFilter,
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
    }, [currentPage, pageSize, columnFilters, sorting, toast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleDelete = async () => {
        if (!selectedOrder) return;
        try {
            await deleteOrder(selectedOrder.orderId);
            toast({ title: "Thành công", description: `Đơn hàng "${selectedOrder.orderId}" đã được xóa.` });
            fetchOrders();
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            toast({ title: "Lỗi", description: "Không thể xóa đơn hàng.", variant: "destructive" });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedOrder(null);
        }
    };

    const table = useReactTable({
        data: orders,
        columns: columns((order, action) => {
            if (action === "view") {
                setSelectedOrder(order);
                setDetailDialogOpen(true);
            } else if (action === "edit") {
                setSelectedOrder(order);
                setEditDialogOpen(true);
            } else if (action === "delete") {
                setSelectedOrder(order);
                setDeleteDialogOpen(true);
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

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

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
                        <Button onClick={() => setEditDialogOpen(true)} disabled={loading}>
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
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-center">
                                            {header.isPlaceholder ? null : (
                                                header.column.getCanSort() ? (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() ? (
                                                            header.column.getIsSorted() === "asc" ? " ↑" : " ↓"
                                                        ) : null}
                                                    </Button>
                                                ) : (
                                                    flexRender(header.column.columnDef.header, header.getContext())
                                                )
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
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 py-4">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Hiển thị</p>
                        <PageSizeSelector
                            loading={loading}
                            pageSize={pageSize}
                            setCurrentPage={setCurrentPage}
                            setPageSize={setPageSize}
                        />
                        <p className="text-sm font-medium">mục mỗi trang</p>
                    </div>
                    {loading ? (
                        <Skeleton className="h-5 w-64" />
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Đang hiển thị {totalItems > 0 ? startItem : 0} đến {endItem} trong tổng số {totalItems} mục
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1 || loading || totalPages === 0}
                        >
                            <span className="sr-only">Trang đầu</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loading || totalPages === 0}
                        >
                            <span className="sr-only">Trang trước</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {loading ? (
                            <Skeleton className="h-5 w-16" />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                {totalPages === 0 ? (
                                    <span className="text-sm text-muted-foreground">Không có dữ liệu</span>
                                ) : (
                                    <>
                                        <span className="text-sm font-medium">Trang {currentPage}</span>
                                        <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                                    </>
                                )}
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || loading || totalPages === 0}
                        >
                            <span className="sr-only">Trang sau</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || loading || totalPages === 0}
                        >
                            <span className="sr-only">Trang cuối</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
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
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa đơn hàng "{selectedOrder?.orderId}"? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ManageOrders;