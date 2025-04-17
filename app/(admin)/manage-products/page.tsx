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
import { columns } from "@/components/manage-products/columns";
import useDebounce from "@/hooks/use-debounce";
import { EBaseStatusFilterDropdown, ExportButton, NoResultsRow, PageSizeSelector, RefreshButton, SearchInput } from "@/components/common";
import { getProducts, deleteProduct } from "@/services/product";
import { Product } from "@/interfaces/product";
import { multiSelectFilter } from "@/utils/table";
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
import { ProductDialog, ProductDetailDialog } from "@/components/dialog/product";


const ManageProducts = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState<Product[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // State for dialogs
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [detailProduct, setDetailProduct] = useState<Product | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // Search state
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    // Update columnFilters for name
    useEffect(() => {
        table.getColumn("name")?.setFilterValue(debouncedSearchValue || undefined);
    }, [debouncedSearchValue]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const filterBy = columnFilters.find((f) => f.id === "name")?.id || undefined;
            const filterQuery = columnFilters.find((f) => f.id === "name")?.value as string | undefined;
            const sortBy = sorting.length > 0 ? sorting[0]?.id : undefined;
            const isAsc = sorting.length > 0 ? !sorting[0]?.desc : undefined;
            const statusFilter = columnFilters.find((filter) => filter.id === "status")?.value as string | undefined;

            const response = await getProducts({
                filterBy,
                filterQuery,
                page: currentPage,
                size: pageSize,
                sortBy,
                isAsc,
                status: statusFilter,
            });

            setProducts(response.items);
            setTotalItems(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error(err);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách sản phẩm.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, columnFilters, sorting, toast]);

    // Handle add/edit success
    const handleSuccess = () => {
        fetchProducts();
        setDialogOpen(false);
        setSelectedProduct(undefined);
    };

    // Open edit dialog
    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setDialogOpen(true);
    };

    // Open detail dialog
    const handleViewDetails = (product: Product) => {
        setDetailProduct(product);
        setDetailDialogOpen(true);
    };

    // Handle delete
    const handleDelete = (product: Product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete.productId);
            toast({
                title: "Thành công",
                description: `Sản phẩm "${productToDelete.name}" đã được xóa.`,
            });
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa sản phẩm. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    // Open add dialog
    const handleAdd = () => {
        setSelectedProduct(undefined);
        setDialogOpen(true);
    };

    const table = useReactTable({
        data: products,
        columns: columns({
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onDelete: handleDelete,
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
            pagination: { pageIndex: currentPage - 1, pageSize },
        },
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        pageCount: totalPages,
        filterFns: { multiSelect: multiSelectFilter },
    });

    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const toggleLoading = () => {
        fetchProducts();
    };

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý sản phẩm</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả các sản phẩm.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={loading} />
                        <RefreshButton loading={loading} toggleLoading={toggleLoading} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <SearchInput
                            loading={loading}
                            placeHolderText="Tìm kiếm sản phẩm..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <EBaseStatusFilterDropdown loading={loading} table={table} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={loading}>
                                    Cột <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table.getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id === "productId" ? "Mã sản phẩm" :
                                                column.id === "name" ? "Tên sản phẩm" :
                                                    column.id === "size" ? "Kích thước" :
                                                        column.id === "type" ? "Loại sản phẩm" :
                                                            column.id === "price" ? "Giá" :
                                                                column.id === "status" ? "Trạng thái" :
                                                                    column.id === "createdDate" ? "Ngày tạo" :
                                                                        column.id === "updatedDate" ? "Ngày cập nhật" :
                                                                            column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleAdd} disabled={loading}>
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
                                        {columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { } }).map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "productId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "name" ? (
                                                    <Skeleton className="h-5 w-40 mx-auto" />
                                                ) : column.id === "size" ? (
                                                    <Skeleton className="h-5 w-20 mx-auto" />
                                                ) : column.id === "type" ? (
                                                    <Skeleton className="h-5 w-20 mx-auto" />
                                                ) : column.id === "price" ? (
                                                    <Skeleton className="h-5 w-28 mx-auto" />
                                                ) : column.id === "status" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "createdDate" || column.id === "updatedDate" ? (
                                                    <div className="flex justify-center items-center gap-2">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-24" />
                                                    </div>
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
                            ) : products.length ? (
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
                                <NoResultsRow columns={columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { } })} />
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
            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleSuccess}
                product={selectedProduct}
            />
            <ProductDetailDialog
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open);
                    if (!open) setDetailProduct(null);
                }}
                product={detailProduct}
            />
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setProductToDelete(null)}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ManageProducts;