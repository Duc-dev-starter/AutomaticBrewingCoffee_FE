"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
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
import { columns } from "@/components/manage-products/columns";
import { ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { deleteProduct, cloneProduct } from "@/services/product";
import { Product } from "@/interfaces/product";
import { multiSelectFilter } from "@/utils/table";
import { ProductFilter } from "@/components/manage-products/filter";
import { FilterBadges } from "@/components/manage-products/filter-badges";
import { ErrorResponse } from "@/types/error";
import { useDebounce, useProducts, useToast } from "@/hooks";
const ProductDialog = React.lazy(() => import("@/components/dialog/product").then(module => ({ default: module.ProductDialog })));
const ProductDetailDialog = React.lazy(() => import("@/components/dialog/product").then(module => ({ default: module.ProductDetailDialog })));
const ConfirmDeleteDialog = React.lazy(() => import("@/components/common").then(module => ({ default: module.ConfirmDeleteDialog })));

const ManageProducts = () => {
    const { toast } = useToast();
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [statusFilter, setStatusFilter] = useState<string>("");
    const [productTypeFilter, setProductTypeFilter] = useState<string>("");
    const [productSizeFilter, setProductSizeFilter] = useState<string>("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [detailProduct, setDetailProduct] = useState<Product | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [flashingProductId, setFlashingProductId] = useState<string | null>(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const params = {
        filterBy: debouncedSearchValue ? "name" : undefined,
        filterQuery: debouncedSearchValue || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: sorting.length > 0 ? sorting[0]?.id : undefined,
        isAsc: sorting.length > 0 ? !sorting[0]?.desc : undefined,
        status: statusFilter || undefined,
        productType: productTypeFilter || undefined,
        productSize: productSizeFilter || undefined,
    };

    const { data, error, isLoading, mutate } = useProducts(params);

    useEffect(() => {
        if (error) {
            toast({
                title: "Lỗi khi lấy danh sách sản phẩm",
                description: error.message || "Đã xảy ra lỗi không xác định",
                variant: "destructive",
            });
        }
    }, [error, toast]);

    useEffect(() => {
        table.getColumn("name")?.setFilterValue(debouncedSearchValue || undefined);
        table.getColumn("status")?.setFilterValue(statusFilter || undefined);
        table.getColumn("type")?.setFilterValue(productTypeFilter || undefined);
        table.getColumn("size")?.setFilterValue(productSizeFilter || undefined);
    }, [debouncedSearchValue, statusFilter, productTypeFilter, productSizeFilter]);

    const handleSuccess = () => {
        mutate();
        setDialogOpen(false);
        setSelectedProduct(undefined);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setDialogOpen(true);
    };

    const handleViewDetails = useCallback((product: Product) => {
        setDetailProduct(product);
        setDetailDialogOpen(true);
    }, []);

    const handleDelete = (product: Product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete.productId);
            toast({
                title: "Thành công",
                description: `Sản phẩm "${productToDelete.name}" đã được xóa.`,
            });
            mutate();
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xóa sản phẩm:", err);
            toast({
                title: "Lỗi khi xóa sản phẩm",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    const handleAdd = () => {
        setSelectedProduct(undefined);
        setDialogOpen(true);
    };

    const clearAllFilters = () => {
        setStatusFilter("");
        setProductTypeFilter("");
        setProductSizeFilter("");
        setSearchValue("");
        table.resetColumnFilters();
    };

    const handleClone = async (product: Product) => {
        try {
            const response = await cloneProduct(product.productId);
            const newProductId = response.response.productId;
            toast({
                title: "Thành công",
                description: `Sản phẩm "${product.name}" đã được nhân bản.`,
            });
            mutate();
            setFlashingProductId(newProductId);
            setIsFlashing(true);
            setTimeout(() => {
                setIsFlashing(false);
                setFlashingProductId(null);
            }, 6000);
        } catch (error) {
            const err = error as ErrorResponse;
            console.log(error);
            toast({
                title: "Lỗi khi nhân bản sản phẩm",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    const hasActiveFilters = statusFilter !== "" || productTypeFilter !== "" || productSizeFilter !== "" || searchValue !== "";

    const columnsDef = useMemo(
        () => columns({
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onClone: handleClone,
        }),
        [handleViewDetails, handleEdit, handleDelete, handleClone]
    );

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
    });

    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    useEffect(() => {
        setCurrentPage(1);
    }, [columnFilters]);

    const visibleCount = useMemo(
        () => table.getAllColumns().filter(col => col.getIsVisible()).length,
        [table.getState().columnVisibility]
    );

    const totalCount = useMemo(
        () => table.getAllColumns().length,
        []
    );

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý sản phẩm</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả các sản phẩm.</p>
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
                            placeHolderText="Tìm kiếm sản phẩm..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <ProductFilter
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            clearAllFilters={clearAllFilters}
                            hasActiveFilters={hasActiveFilters}
                            loading={isLoading}
                            productTypeFilter={productTypeFilter}
                            setProductTypeFilter={setProductTypeFilter}
                            productSizeFilter={productSizeFilter}
                            setProductSizeFilter={setProductSizeFilter}
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
                                                column.id == "imageUrl" ? "Hình ảnh" :
                                                    column.id === "name" ? "Tên sản phẩm" :
                                                        // column.id === "size" ? "Size" :
                                                        column.id === "type" ? "Loại sản phẩm" :
                                                            column.id === "price" ? "Giá" :
                                                                column.id === "productCategoryId" ? "Danh mục" :
                                                                    column.id === "isHasWorkflow" ? "Có quy trình" :
                                                                        column.id === "status" ? "Trạng thái" :
                                                                            column.id === "createdDate" ? "Ngày tạo" :
                                                                                column.id === "updatedDate" ? "Ngày cập nhật" :
                                                                                    column.id === "actions" ? "Hành động" : column.id
                                            }
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleAdd}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                    </div>
                </div>

                <FilterBadges
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    hasActiveFilters={hasActiveFilters}
                    productTypeFilter={productTypeFilter}
                    setProductTypeFilter={setProductTypeFilter}
                    productSizeFilter={productSizeFilter}
                    setProductSizeFilter={setProductSizeFilter}
                />

                <div className="rounded-md border">
                    <Table className="table-fixed">
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
                            {(!data && isLoading) ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                                        {columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { }, onClone: () => { } }).map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "productId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "imageUrl" ? (
                                                    <Skeleton className="h-5 w-40 mx-auto" />
                                                ) : column.id === "name" ? (
                                                    <Skeleton className="h-5 w-40 mx-auto" />
                                                ) : column.id === "size" ? (
                                                    <Skeleton className="h-5 w-20 mx-auto" />
                                                    // ) : column.id === "type" ? (
                                                    //     <Skeleton className="h-5 w-20 mx-auto" />
                                                ) : column.id === "price" ? (
                                                    <Skeleton className="h-5 w-28 mx-auto" />
                                                ) : column.id === "productCategoryId" ? (
                                                    <Skeleton className="h-5 w-28 mx-auto" />
                                                ) : column.id === "isHasWorkflow" ? (
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
                            ) : data?.items?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={isFlashing && row.original.productId === flashingProductId ? "flash" : ""}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <NoResultsRow columns={columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { }, onClone: () => { } })} />
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

            <React.Suspense fallback={<div className="hidden">Đang tải...</div>}>
                <ProductDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSuccess={handleSuccess}
                    product={selectedProduct}
                />
            </React.Suspense>

            <React.Suspense fallback={<div className="hidden">Đang tải...</div>}>
                <ProductDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={(open) => {
                        setDetailDialogOpen(open);
                        if (!open) setDetailProduct(null);
                    }}
                    product={detailProduct}
                />
            </React.Suspense>

            <React.Suspense fallback={<div className="hidden">Đang tải...</div>}>
                <ConfirmDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    description={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}"? Hành động này không thể hoàn tác.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setProductToDelete(null)}
                />
            </React.Suspense>
        </div>
    );
};

export default ManageProducts;