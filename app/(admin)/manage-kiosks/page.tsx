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
import { ConfirmDeleteDialog, EBaseStatusFilterDropdown, ExportButton, NoResultsRow, PageSizeSelector, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { getKiosks, deleteKiosk } from "@/services/kiosk";
import { Kiosk } from "@/interfaces/kiosk";
import { multiSelectFilter } from "@/utils/table";
import { useToast } from "@/hooks/use-toast";
import { columns } from "@/components/manage-kiosks/columns";
import { KioskDetailDialog, KioskDialog } from "@/components/dialog/kiosk";

const ManageKiosks = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [kiosks, setKiosks] = useState<Kiosk[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | undefined>(undefined);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [detailKiosk, setDetailKiosk] = useState<Kiosk | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [kioskToDelete, setKioskToDelete] = useState<Kiosk | null>(null);

    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const isInitialMount = useRef(true);

    // Đồng bộ tìm kiếm với columnFilters
    useEffect(() => {
        if (isInitialMount.current) {
            return; // Bỏ qua lần đầu khi mount
        }
        table.getColumn("location")?.setFilterValue(debouncedSearchValue || undefined);
    }, [debouncedSearchValue]);

    const fetchKiosks = useCallback(async () => {
        try {
            setLoading(true);

            const locationFilter = columnFilters.find((filter) => filter.id === "location");
            const filterBy = locationFilter ? "location" : undefined;
            const filterQuery = locationFilter?.value as string | undefined;

            const statusFilterValue = columnFilters.find((filter) => filter.id === "status")?.value as string | undefined;

            const sortBy = sorting.length > 0 ? sorting[0]?.id : undefined;
            const isAsc = sorting.length > 0 ? !sorting[0]?.desc : undefined;

            const response = await getKiosks({
                filterBy,
                filterQuery,
                page: currentPage,
                size: pageSize,
                sortBy,
                isAsc,
                status: statusFilterValue,
            });

            setKiosks(response.items);
            setTotalItems(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error(err);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách kiosk.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, columnFilters, sorting, toast]);

    // Gọi fetchKiosks khi mount và khi có thay đổi
    useEffect(() => {
        fetchKiosks();
        isInitialMount.current = false;
    }, [fetchKiosks]);

    const handleSuccess = () => {
        fetchKiosks();
        setDialogOpen(false);
        setSelectedKiosk(undefined);
    };

    const handleEdit = (kiosk: Kiosk) => {
        setSelectedKiosk(kiosk);
        setDialogOpen(true);
    };

    const handleViewDetails = (kiosk: Kiosk) => {
        setDetailKiosk(kiosk);
        setDetailDialogOpen(true);
    };

    const handleDelete = (kiosk: Kiosk) => {
        setKioskToDelete(kiosk);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!kioskToDelete) return;
        try {
            await deleteKiosk(kioskToDelete.kioskId);
            toast({
                title: "Thành công",
                description: `Kiosk tại "${kioskToDelete.location}" đã được xóa.`,
            });
            fetchKiosks();
        } catch (error) {
            console.error("Lỗi khi xóa kiosk:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa kiosk. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setKioskToDelete(null);
        }
    };

    const handleAdd = () => {
        setSelectedKiosk(undefined);
        setDialogOpen(true);
    };

    const table = useReactTable({
        data: kiosks,
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

    const toggleLoading = () => {
        fetchKiosks();
    };

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý kiosk</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả kiosk.</p>
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
                            placeHolderText="Tìm kiếm địa chỉ kiosk..."
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
                                            {{
                                                kioskId: "Mã kiosk",
                                                location: "Địa chỉ",
                                                franchise: "Franchise",
                                                deviceName: "Thiết bị",
                                                status: "Trạng thái",
                                                installedDate: "Ngày lắp đặt",
                                                createdDate: "Ngày tạo",
                                                updatedDate: "Ngày cập nhật",
                                            }[column.id] ?? column.id}
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
                                                {column.id === "kioskId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "franchise" ? (
                                                    <Skeleton className="h-5 w-32 mx-auto" />
                                                ) : column.id === "deviceName" ? (
                                                    <Skeleton className="h-5 w-40 mx-auto" />
                                                ) : column.id === "location" ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-40" />
                                                    </div>
                                                ) : column.id === "status" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "installedDate" ? (
                                                    <Skeleton className="h-5 w-28 mx-auto" />
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
                            ) : kiosks.length ? (
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
                                <NoResultsRow columns={columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { } })} />
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
            <KioskDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleSuccess}
                kiosk={selectedKiosk}
            />
            <KioskDetailDialog
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open);
                    if (!open) setDetailKiosk(null);
                }}
                kiosk={detailKiosk}
            />
            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                description={`Bạn có chắc chắn muốn xóa kiosk tại "${kioskToDelete?.location}"? Hành động này không thể hoàn tác.`}
                onConfirm={confirmDelete}
                onCancel={() => setKioskToDelete(null)}
            />
        </div>
    );
};

export default ManageKiosks;