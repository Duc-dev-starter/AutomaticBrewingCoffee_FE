"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { SyncEvent } from "@/interfaces/sync";
import { ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { syncEventColumns } from "@/components/manage-syncs/columns";
import { SyncEventDetailDialog } from "@/components/dialog/sync";
import { useDebounce, useSyncEvents, useToast } from "@/hooks";
import { multiSelectFilter } from "@/utils/table";

const ManageSyncEvents = () => {
    const { toast } = useToast();
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [detailSyncEvent, setDetailSyncEvent] = useState<SyncEvent | null>(null);

    const params = {
        filterBy: debouncedSearchValue ? "entityId" : undefined,
        filterQuery: debouncedSearchValue || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: sorting.length > 0 ? sorting[0]?.id : undefined,
        isAsc: sorting.length > 0 ? !sorting[0]?.desc : undefined,
        type: typeFilter || undefined,
    };

    const { data, error, isLoading, mutate } = useSyncEvents(params);

    useEffect(() => {
        if (error) {
            toast({
                title: "Lỗi khi lấy danh sách sự kiện đồng bộ",
                description: error.message || "Đã xảy ra lỗi không xác định",
                variant: "destructive",
            });
        }
    }, [error, toast]);

    useEffect(() => {
        // Prefetch trang tiếp theo nếu còn trang
        if (data?.totalPages && currentPage < data.totalPages) {
            useSyncEvents({
                ...params,
                page: currentPage + 1,
            });
        }
    }, [currentPage, data?.totalPages, params]);

    useEffect(() => {
        table.getColumn("entityId")?.setFilterValue(debouncedSearchValue || undefined);
        table.getColumn("syncEventType")?.setFilterValue(typeFilter || undefined);
    }, [debouncedSearchValue, typeFilter]);

    const handleViewDetails = useCallback((syncEvent: SyncEvent) => {
        setDetailSyncEvent(syncEvent);
        setDetailDialogOpen(true);
    }, []);

    const columnsDef = useMemo(
        () => syncEventColumns({ onViewDetails: handleViewDetails }),
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

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý sự kiện đồng bộ</h2>
                        <p className="text-muted-foreground">Quản lý các sự kiện đồng bộ.</p>
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
                            placeHolderText="Tìm kiếm theo mã thực thể..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Loại sự kiện: {typeFilter || "Tất cả"} <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuCheckboxItem
                                    checked={typeFilter === ""}
                                    onCheckedChange={() => setTypeFilter("")}
                                >
                                    Tất cả
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={typeFilter === "Create"}
                                    onCheckedChange={() => setTypeFilter("Create")}
                                >
                                    Create
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={typeFilter === "Update"}
                                    onCheckedChange={() => setTypeFilter("Update")}
                                >
                                    Update
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={typeFilter === "Delete"}
                                    onCheckedChange={() => setTypeFilter("Delete")}
                                >
                                    Delete
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
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
                                            {column.id}
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
                                            {header.isPlaceholder ? null : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
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
                                        {columnsDef.map((_, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                <Skeleton className="h-5 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : data?.items?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <NoResultsRow columns={columnsDef} />
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
            <SyncEventDetailDialog
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open);
                    if (!open) setDetailSyncEvent(null);
                }}
                syncEvent={detailSyncEvent}
            />
        </div>
    );
};

export default ManageSyncEvents;