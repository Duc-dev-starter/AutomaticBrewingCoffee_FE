"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons"; // Vẫn giữ lại để dùng ở nơi khác nếu cần
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
import { deleteProduct, cloneProduct } from "@/services/product.service";
import { Product } from "@/interfaces/product";
import { multiSelectFilter } from "@/utils/table";
import { ProductFilter } from "@/components/manage-products/filter";
import { FilterBadges } from "@/components/manage-products/filter-badges";
import { ErrorResponse } from "@/types/error";
import { useDebounce, useProducts, useToast } from "@/hooks";
import { cn } from "@/lib/utils"; // Import cn utility

// --- Lazy imports không đổi ---
const ProductDialog = React.lazy(() => import("@/components/dialog/product").then(module => ({ default: module.ProductDialog })));
const ProductDetailDialog = React.lazy(() => import("@/components/dialog/product").then(module => ({ default: module.ProductDetailDialog })));
const ConfirmDeleteDialog = React.lazy(() => import("@/components/common").then(module => ({ default: module.ConfirmDeleteDialog })));

const ManageProducts = () => {
    // --- State và hooks không đổi ---
    const { toast } = useToast();
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ createdDate: false, updatedDate: false });
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [productTypeFilter, setProductTypeFilter] = useState<string>("");
    const [productSizeFilter, setProductSizeFilter] = useState<string>("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [detailProduct, setDetailProduct] = useState<Product | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [flashingProductId, setFlashingProductId] = useState<string | null>(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, 500);
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

    // --- Các hàm xử lý và data fetching không đổi ---
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
        if (error) { toast({ title: "Lỗi khi lấy danh sách sản phẩm", description: error.message || "Đã xảy ra lỗi không xác định", variant: "destructive" }); }
    }, [error, toast]);

    const handleSuccess = () => { mutate(); setDialogOpen(false); setSelectedProduct(undefined); };
    const handleEdit = (product: Product) => { setSelectedProduct(product); setDialogOpen(true); };
    const handleViewDetails = useCallback((product: Product) => { setDetailProduct(product); setDetailDialogOpen(true); }, []);
    const handleDelete = (product: Product) => { setProductToDelete(product); setDeleteDialogOpen(true); };
    const confirmDelete = async () => { if (!productToDelete) return; try { await deleteProduct(productToDelete.productId); toast({ title: "Thành công", description: `Sản phẩm "${productToDelete.name}" đã được xóa.` }); mutate(); } catch (error: unknown) { const err = error as ErrorResponse; console.error("Lỗi khi xóa sản phẩm:", err); toast({ title: "Lỗi khi xóa sản phẩm", description: err.message, variant: "destructive", }); } finally { setDeleteDialogOpen(false); setProductToDelete(null); } };
    const handleAdd = () => { setSelectedProduct(undefined); setDialogOpen(true); };
    const clearAllFilters = () => { setStatusFilter(""); setProductTypeFilter(""); setProductSizeFilter(""); setSearchValue(""); table.resetColumnFilters(); };
    const handleClone = async (product: Product) => { try { const response = await cloneProduct(product.productId); const newProductId = response.response.productId; toast({ title: "Thành công", description: `Sản phẩm "${product.name}" đã được nhân bản.` }); mutate(); setFlashingProductId(newProductId); setIsFlashing(true); setTimeout(() => { setIsFlashing(false); setFlashingProductId(null); }, 6000); } catch (error) { const err = error as ErrorResponse; toast({ title: "Lỗi khi nhân bản sản phẩm", description: err.message, variant: "destructive" }); } };
    const hasActiveFilters = statusFilter !== "" || productTypeFilter !== "" || productSizeFilter !== "" || searchValue !== "";

    const columnsDef = useMemo(
        () => columns({ onViewDetails: handleViewDetails, onEdit: handleEdit, onDelete: handleDelete, onClone: handleClone, }),
        [handleViewDetails]
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
        state: { sorting, columnFilters, columnVisibility, pagination: { pageIndex: currentPage - 1, pageSize }, },
        manualPagination: true, manualFiltering: true, manualSorting: true, pageCount: data?.totalPages || 1, filterFns: { multiSelect: multiSelectFilter },
    });
    useEffect(() => { table.setPageSize(pageSize); }, [pageSize, table]);
    useEffect(() => { setCurrentPage(1); }, [columnFilters]);

    // Đổi tên để rõ ràng hơn: số cột lá có thể nhìn thấy
    const visibleLeafColumnsCount = useMemo(() => table.getVisibleLeafColumns().length, [table.getState().columnVisibility]);
    const totalCount = useMemo(() => table.getAllColumns().length, [table]);

    const groupedProducts = useMemo(() => {
        if (!data?.items) return [];
        const parentMap: { [key: string]: Product[] } = {};
        data.items.forEach(p => { if (p.parentId) { if (!parentMap[p.parentId]) parentMap[p.parentId] = []; parentMap[p.parentId].push(p); } });
        const parents = data.items.filter(p => !p.parentId);
        return parents.map(parent => ({ parent, children: parentMap[parent.productId] || [], }));
    }, [data?.items]);

    const toggleExpand = (parentId: string) => {
        setExpandedRows(prev => ({ ...prev, [parentId]: !prev[parentId], }));
    };

    useEffect(() => {
        table.getColumn("name")?.setFilterValue(debouncedSearchValue || undefined);
        table.getColumn("status")?.setFilterValue(statusFilter || undefined);
        table.getColumn("type")?.setFilterValue(productTypeFilter || undefined);
        table.getColumn("size")?.setFilterValue(productSizeFilter || undefined);
    }, [debouncedSearchValue, statusFilter, productTypeFilter, productSizeFilter, table]);

    return (
        <div className="w-full">
            {/* // --- Phần Header, Filter, Buttons không đổi --- */}
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
                        <SearchInput loading={isLoading} placeHolderText="Tìm kiếm sản phẩm..." searchValue={searchValue} setSearchValue={setSearchValue} />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <ProductFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} clearAllFilters={clearAllFilters} hasActiveFilters={hasActiveFilters} loading={isLoading} productTypeFilter={productTypeFilter} setProductTypeFilter={setProductTypeFilter} productSizeFilter={productSizeFilter} setProductSizeFilter={setProductSizeFilter} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Cột <span className="ml-1 bg-gray-200 rounded-full px-2 pt-0.5 pb-1 text-xs font-semibold">{visibleLeafColumnsCount}/{totalCount}</span> <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                                    <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                                        {{ "productId": "Mã sản phẩm", "image": "Hình ảnh", "name": "Tên sản phẩm", "type": "Loại sản phẩm", "price": "Giá", "productCategoryId": "Danh mục", "isHasWorkflow": "Có quy trình", "status": "Trạng thái", "createdDate": "Ngày tạo", "updatedDate": "Ngày cập nhật", "actions": "Hành động" }[column.id] || column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" /> Thêm</Button>
                    </div>
                </div>
                <FilterBadges searchValue={searchValue} setSearchValue={setSearchValue} statusFilter={statusFilter} setStatusFilter={setStatusFilter} hasActiveFilters={hasActiveFilters} productTypeFilter={productTypeFilter} setProductTypeFilter={setProductTypeFilter} productSizeFilter={productSizeFilter} setProductSizeFilter={setProductSizeFilter} />
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-center">{header.isPlaceholder ? null : (header.column.getCanSort() ? (<Button variant="ghost" onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getIsSorted() ? (header.column.getIsSorted() === "asc" ? " ↑" : " ↓") : null}</Button>) : (flexRender(header.column.columnDef.header, header.getContext())))}</TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        {table.getVisibleLeafColumns().map((column) => (<TableCell key={column.id}><Skeleton className="h-5 w-full" /></TableCell>))}
                                    </TableRow>
                                ))
                            ) : groupedProducts.length ? (
                                groupedProducts.map(({ parent, children }) => {
                                    const parentRow = table.getRowModel().rows.find(r => r.original.productId === parent.productId);
                                    if (!parentRow) return null;
                                    const hasChildren = children.length > 0;

                                    // ===== THAY ĐỔI BẮT ĐẦU TẠI ĐÂY =====
                                    return (
                                        <React.Fragment key={parent.productId}>
                                            {/* Render hàng cha */}
                                            <TableRow
                                                data-state={parentRow.getIsSelected() && "selected"}
                                                // CHỈ ĐỊNH onClick và className có điều kiện
                                                onClick={hasChildren ? () => toggleExpand(parent.productId) : undefined}
                                                className={cn(
                                                    hasChildren && "cursor-pointer hover:bg-muted/50",
                                                    expandedRows[parent.productId] && "bg-muted/50" // Thêm style khi đang mở
                                                )}
                                            >
                                                {parentRow.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id} className="text-center">
                                                        {/* Đã loại bỏ nút expand/collapse khỏi đây */}
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>

                                            {/* Render các hàng con nếu đang được expand */}
                                            {expandedRows[parent.productId] && (
                                                hasChildren ? (
                                                    children.map(child => {
                                                        const childRow = table.getRowModel().rows.find(r => r.original.productId === child.productId);
                                                        if (!childRow) return null;
                                                        return (
                                                            <TableRow key={child.productId} className="bg-gray-50 hover:bg-gray-100">
                                                                {childRow.getVisibleCells().map(cell => (
                                                                    <TableCell key={cell.id} className="pl-10 text-center">
                                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : (
                                                    // Trường hợp được expand nhưng lại không có con -> Hiển thị thông báo
                                                    <TableRow>
                                                        <TableCell colSpan={visibleLeafColumnsCount} className="p-4 text-center text-muted-foreground bg-gray-50">
                                                            Sản phẩm này không có sản phẩm con nào.
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </React.Fragment>
                                    );
                                    // ===== KẾT THÚC THAY ĐỔI =====
                                })
                            ) : (
                                <NoResultsRow columns={columnsDef} />
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination loading={isLoading} pageSize={pageSize} setPageSize={setPageSize} currentPage={currentPage} setCurrentPage={setCurrentPage} totalItems={data?.total || 0} totalPages={data?.totalPages || 1} />
            </div>

            {/* // --- Các Dialogs không đổi --- */}
            <React.Suspense fallback={null}><ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={handleSuccess} product={selectedProduct} /></React.Suspense>
            <React.Suspense fallback={null}><ProductDetailDialog open={detailDialogOpen} onOpenChange={(open) => { setDetailDialogOpen(open); if (!open) setDetailProduct(null); }} product={detailProduct} /></React.Suspense>
            <React.Suspense fallback={null}><ConfirmDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} description={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}"? Hành động này không thể hoàn tác.`} onConfirm={confirmDelete} onCancel={() => setProductToDelete(null)} /></React.Suspense>
        </div>
    );
};

export default ManageProducts;