"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
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
import { BaseStatusFilter, ConfirmBanUnbanDialog, ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { multiSelectFilter } from "@/utils/table";
import { ErrorResponse } from "@/types/error";
import { columns } from "@/components/manage-accounts/columns";
import { Account } from "@/interfaces/account";
import { banAccount, unbanAccount } from "@/services/auth";
import { AccountDetailDialog } from "@/components/dialog/account";
import { useAccounts, useDebounce, useToast } from "@/hooks";

const ManageAccounts = () => {
    const { toast } = useToast();
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
    const [detailAccount, setDetailAccount] = useState<Account | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [accountToBanOrUnban, setAccountToBanOrUnban] = useState<Account | null>(null);

    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const params = {
        filterBy: debouncedSearchValue ? "fullName" : undefined,
        filterQuery: debouncedSearchValue || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: sorting.length > 0 ? sorting[0]?.id : undefined,
        isAsc: sorting.length > 0 ? !sorting[0]?.desc : undefined,
        status: statusFilter || undefined,
    };

    const { data, error, isLoading, mutate } = useAccounts(params);

    useEffect(() => {
        table.getColumn("fullName")?.setFilterValue(debouncedSearchValue || undefined);
    }, [debouncedSearchValue, statusFilter]);

    useEffect(() => {
        if (error) {
            toast({
                title: "Lỗi khi lấy danh sách tài khoản",
                description: error.message || "Đã xảy ra lỗi không xác định",
                variant: "destructive",
            });
        }
    }, [error, toast]);

    // useEffect(() => {
    //     // Prefetch trang tiếp theo nếu còn trang
    //     if (data?.totalPages && currentPage < data.totalPages) {
    //         useAccounts({
    //             ...params,
    //             page: currentPage + 1,
    //         });
    //     }
    // }, [currentPage, data?.totalPages, params]);


    const handleViewDetails = useCallback((account: Account) => {
        setDetailAccount(account);
        setDetailDialogOpen(true);
    }, [])

    const handleToggle = useCallback((account: Account) => {
        setAccountToBanOrUnban(account);
        setDeleteDialogOpen(true);
    }, [])

    const confirmBanOrUnban = async (reason: string) => {
        if (!accountToBanOrUnban) return;
        try {
            if (accountToBanOrUnban.isBanned) {
                await unbanAccount({
                    accountId: accountToBanOrUnban.accountId,
                    unbannedReason: reason,
                });
                toast({
                    title: "Thành công",
                    description: `Tài khoản "${accountToBanOrUnban.fullName}" đã được mở khóa.`,
                });
            } else {
                await banAccount({
                    accountId: accountToBanOrUnban.accountId,
                    bannedReason: reason,
                });
                toast({
                    title: "Thành công",
                    description: `Tài khoản "${accountToBanOrUnban.fullName}" đã được khóa.`,
                });
            }
            mutate();
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi thao tác với account:", err);
            toast({
                title: "Lỗi",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setAccountToBanOrUnban(null);
        }
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
            handleToggle: handleToggle,
        }),
        [handleViewDetails, handleToggle]
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
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý tài khoản</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả các tài khoản pha cà phê tự động.</p>
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
                            placeHolderText="Tìm kiếm tài khoản..."
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
                                            {column.id === "accountId" ? "Mã tài khoản" :
                                                column.id === "fullName" ? "Tên tài khoản" : ""}
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
                                        {columns({ onViewDetails: () => { }, handleToggle: () => { } }).map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "accountId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "fullName" ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-40" />
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
                                <NoResultsRow columns={columns({ onViewDetails: () => { }, handleToggle: () => { } })} />
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
            <AccountDetailDialog
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open);
                    if (!open) setDetailAccount(null);
                }}
                account={detailAccount}
            />

            <ConfirmBanUnbanDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmBanOrUnban}
                item={accountToBanOrUnban}
                action={accountToBanOrUnban?.isBanned ? "unban" : "ban"}
            />
        </div>
    );
};

export default ManageAccounts;