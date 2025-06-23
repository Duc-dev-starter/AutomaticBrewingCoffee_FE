"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { DeviceType } from "@/interfaces/device";
import { BaseStatusFilter, ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { multiSelectFilter } from "@/utils/table";
import { deleteDeviceType } from "@/services/device";
import { columns } from "@/components/manage-devices/manage-device-types/columns";
import { BaseFilterBadges } from "@/components/common/base-filter-badges";
import { ErrorResponse } from "@/types/error";
import { useDebounce, useDeviceTypes, useToast } from "@/hooks";
const DeviceTypeDialog = React.lazy(() => import("@/components/dialog/device").then(module => ({ default: module.DeviceTypeDialog })));
const DeviceTypeDetailDialog = React.lazy(() => import("@/components/dialog/device").then(module => ({ default: module.DeviceTypeDetailDialog })));
const ConfirmDeleteDialog = React.lazy(() => import("@/components/common").then(module => ({ default: module.ConfirmDeleteDialog })));

const ManageDeviceTypes = () => {
    const { toast } = useToast();
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | undefined>(undefined);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [detailDeviceType, setDetailDeviceType] = useState<DeviceType | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deviceTypeToDelete, setTypeDeviceToDelete] = useState<DeviceType | null>(null);

    const params = {
        filterBy: debouncedSearchValue ? "name" : undefined,
        filterQuery: debouncedSearchValue || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: sorting.length > 0 ? sorting[0]?.id : undefined,
        isAsc: sorting.length > 0 ? !sorting[0]?.desc : undefined,
        status: statusFilter || undefined,
    };

    const { data, error, isLoading, mutate } = useDeviceTypes(params);

    useEffect(() => {
        if (error) {
            toast({
                title: "Lỗi khi lấy danh sách loại thiết bị",
                description: error.message || "Đã xảy ra lỗi không xác định",
                variant: "destructive",
            });
        }
    }, [error, toast]);

    // useEffect(() => {
    //     // Prefetch trang tiếp theo nếu còn trang
    //     if (data?.totalPages && currentPage < data.totalPages) {
    //         useDeviceTypes({
    //             ...params,
    //             page: currentPage + 1,
    //         });
    //     }
    // }, [currentPage, data?.totalPages, params]);

    useEffect(() => {
        table.getColumn("name")?.setFilterValue(debouncedSearchValue || undefined);
        table.getColumn("status")?.setFilterValue(statusFilter || undefined);
    }, [debouncedSearchValue, statusFilter]);

    const handleSuccess = () => {
        mutate();
        setDialogOpen(false);
        setSelectedDeviceType(undefined);
    };

    const handleEdit = useCallback((deviceType: DeviceType) => {
        setSelectedDeviceType(deviceType);
        setDialogOpen(true);
    }, []);

    const handleViewDetails = useCallback((deviceType: DeviceType) => {
        setDetailDeviceType(deviceType);
        setDetailDialogOpen(true);
    }, []);

    const handleDelete = useCallback((deviceType: DeviceType) => {
        setTypeDeviceToDelete(deviceType);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = async () => {
        if (!deviceTypeToDelete) return;
        try {
            await deleteDeviceType(deviceTypeToDelete.deviceTypeId);
            toast({
                title: "Thành công",
                description: `Loại thiết bị "${deviceTypeToDelete.name}" đã được xóa.`,
            });
            mutate();
        } catch (error) {
            const err = error as ErrorResponse;
            toast({
                title: "Lỗi khi xóa loại thiết bị",
                description: err.message || "Đã xảy ra lỗi không xác định",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setTypeDeviceToDelete(null);
        }
    };

    const handleAdd = () => {
        setSelectedDeviceType(undefined);
        setDialogOpen(true);
    };

    const clearAllFilters = () => {
        setStatusFilter("");
        setSearchValue("");
        table.resetColumnFilters();
    };

    const hasActiveFilters = statusFilter !== "" || searchValue !== "";

    const columnsDef = useMemo(
        () => columns({
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onDelete: handleDelete,
        }),
        [handleViewDetails, handleEdit, handleDelete]
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
            rowSelection,
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
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý loại thiết bị</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả các loại thiết bị pha cà phê tự động.</p>
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
                            placeHolderText="Tìm kiếm thiết bị..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <BaseStatusFilter
                            loading={isLoading}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            clearAllFilters={clearAllFilters}
                            hasActiveFilters={hasActiveFilters}
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
                                            {column.id === "deviceTypeId" ? "Mã loại thiết bị" :
                                                column.id === "name" ? "Tên thiết bị" :
                                                    column.id === "description" ? "Mô tả" :
                                                        column.id === "status" ? "Trạng thái" :
                                                            column.id === "createdDate" ? "Ngày tạo" :
                                                                column.id === "updatedDate" ? "Ngày cập nhật" :
                                                                    column.id === "actions" ? "Hành động" : column.id}
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

                <BaseFilterBadges
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    hasActiveFilters={hasActiveFilters}
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
                                        {columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { } }).map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "deviceTypeId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "name" ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-40" />
                                                    </div>
                                                ) : column.id === "description" ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-40" />
                                                    </div>
                                                ) : column.id === "status" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "createdDate" || column.id === "updatedDate" ? (
                                                    <div className="flex items-center gap-2 justify-center">
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
                <DeviceTypeDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSuccess={handleSuccess}
                    deviceType={selectedDeviceType}
                />
            </React.Suspense>

            <React.Suspense fallback={<div className="hidden">Đang tải...</div>}>
                <DeviceTypeDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={(open) => {
                        setDetailDialogOpen(open);
                        if (!open) setDetailDeviceType(null);
                    }}
                    deviceType={detailDeviceType}
                />
            </React.Suspense>
            <React.Suspense fallback={<div className="hidden">Đang tải...</div>}>
                <ConfirmDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    description={`Bạn có chắc chắn muốn xóa loại thiết bị "${deviceTypeToDelete?.name}"? Hành động này không thể hoàn tác.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setTypeDeviceToDelete(null)}
                />
            </React.Suspense>
        </div>
    );
};

export default ManageDeviceTypes;