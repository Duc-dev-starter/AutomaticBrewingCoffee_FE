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
import { ConfirmDeleteDialog, BaseStatusFilter, ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { getKiosks, deleteKiosk, syncKiosk } from "@/services/kiosk";
import { Kiosk } from "@/interfaces/kiosk";
import { multiSelectFilter } from "@/utils/table";
import { useToast } from "@/hooks/use-toast";
import { columns } from "@/components/manage-kiosks/columns";
import { KioskDetailDialog, KioskDialog } from "@/components/dialog/kiosk";
import { BaseFilterBadges } from "@/components/common/base-filter-badges";
import { useRouter } from "next/navigation";
import WebhookDialog from "@/components/dialog/webhook/webhook-dialog";
import { ErrorResponse } from "@/types/error";
import axios from "axios";
import Cookies from "js-cookie"


const ManageKiosks = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState<boolean>(true);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [kiosks, setKiosks] = useState<Kiosk[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [statusFilter, setStatusFilter] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<any>({});

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | undefined>(undefined);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [detailKiosk, setDetailKiosk] = useState<Kiosk | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [kioskToDelete, setKioskToDelete] = useState<Kiosk | null>(null);
    const [webhookDialogOpen, setWebhookDialogOpen] = useState<boolean>(false);
    const [selectedKioskId, setSelectedKioskId] = useState<string | null>(null);

    const isInitialMount = useRef<boolean>(true);

    const hasActiveFilters = statusFilter !== "" || searchValue !== "";

    useEffect(() => {
        if (isInitialMount.current) {
            return;
        }
        table.getColumn("location")?.setFilterValue(debouncedSearchValue || undefined);
        table.getColumn("status")?.setFilterValue(statusFilter || undefined);
    }, [debouncedSearchValue, statusFilter]);

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

    useEffect(() => {
        if (isInitialMount.current) {
            fetchKiosks();
            isInitialMount.current = false;
        } else {
            fetchKiosks();
        }
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
        router.push(`/manage-kiosks/${kiosk.kioskId}`);
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

    const handleSync = async (kiosk: Kiosk) => {
        try {
            const response = await syncKiosk(kiosk.kioskId);
            toast({
                title: "Thành công",
                description: response.message,
            });
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xóa loại kiosk:", err);
            toast({
                title: "Lỗi khi xóa loại kiosk",
                description: err.message,
                variant: "destructive",
            }
            )
        }
    };

    const handleWebhook = (kiosk: Kiosk) => {
        setSelectedKioskId(kiosk.kioskId);
        setWebhookDialogOpen(true);
    };

    const clearAllFilters = () => {
        setStatusFilter("");
        setSearchValue("");
        table.resetColumnFilters();
    };


    const handleExport = async (kiosk: Kiosk) => {
        try {
            const token = Cookies.get('accessToken');
            const headers: any = {
                'accept': 'application/zip',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(
                `https://localhost:30475/api/v1/kiosks/${kiosk.kioskId}/export-setup`,
                {
                    responseType: 'blob',
                    headers: headers,
                }
            );

            if (response.headers['content-type'] === 'application/zip') {
                const blob = new Blob([response.data], { type: 'application/zip' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `kiosk_${kiosk.kioskId}.zip`;
                link.click();
                window.URL.revokeObjectURL(url);
                console.log("Tải file thành công!");
                toast({
                    title: "Thành công",
                    description: "Tải file thành công!",
                });
            } else {
                throw new Error("Server không trả về file ZIP");
            }
        } catch (error) {
            // @ts-ignore
            const errMessage = error.response ? error.response.data : error.message;
            console.log("Chi tiết lỗi:", errMessage);
        } finally {
            setLoading(false);
        }
    };


    const table = useReactTable({
        data: kiosks,
        columns: columns({
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onSync: handleSync,
            onWebhook: handleWebhook,
            onExport: handleExport,
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
                        <BaseStatusFilter
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            clearAllFilters={clearAllFilters}
                            hasActiveFilters={hasActiveFilters}
                            loading={loading}
                        />
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
                                            {{
                                                kioskId: "Mã kiosk",
                                                location: "Địa chỉ",
                                                store: "Cửa hàng",
                                                devices: "Thiết bị",
                                                status: "Trạng thái",
                                                installedDate: "Ngày lắp đặt",
                                                createdDate: "Ngày tạo",
                                                updatedDate: "Ngày cập nhật",
                                            }[column.id] ?? column.id}
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
                                        {columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { }, onSync: () => { }, onWebhook: () => { }, onExport: () => { } }).map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "kioskId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "location" ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-40" />
                                                    </div>
                                                ) : column.id === "store" ? (
                                                    <Skeleton className="h-5 w-32 mx-auto" />
                                                ) : column.id === "devices" ? (
                                                    <Skeleton className="h-5 w-20 mx-auto" />
                                                ) : column.id === "status" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "installedDate" ? (
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
                                <NoResultsRow columns={columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { }, onSync: () => { }, onWebhook: () => { }, onExport: () => { } })} />
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
            <WebhookDialog
                open={webhookDialogOpen}
                onOpenChange={setWebhookDialogOpen}
                kioskId={selectedKioskId || ""}
            />
        </div>
    );
};

export default ManageKiosks;