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
import { ConfirmDeleteDialog, ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { multiSelectFilter } from "@/utils/table";
import { useToast } from "@/hooks/use-toast";
import { LocationType } from "@/interfaces/location";
import { columns } from "@/components/manage-locations/columns";
import { getLocationTypes, deleteLocationType } from "@/services/locationType";
import { LocationTypeDetailDialog, LocationTypeDialog } from "@/components/dialog/locationType";

const ManageLocationTypes = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [locationTypes, setLocationTypes] = useState<LocationType[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<LocationType | undefined>(undefined);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [detailLocation, setDetailLocation] = useState<LocationType | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [locationTypeToDelete, setLocationTypeToDelete] = useState<LocationType | null>(null);

    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const isInitialMount = useRef(true);

    // Gộp đồng bộ tất cả bộ lọc trong một useEffect
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return; // Bỏ qua lần đầu tiên khi mount
        }
        table.getColumn("name")?.setFilterValue(debouncedSearchValue || undefined);
    }, [debouncedSearchValue, statusFilter]);

    const fetchLocationTypes = useCallback(async () => {
        try {
            setLoading(true);

            const nameFilter = columnFilters.find((filter) => filter.id === "name");
            const filterBy = nameFilter ? "name" : undefined;
            const filterQuery = nameFilter?.value as string | undefined;

            const sortBy = sorting.length > 0 ? sorting[0]?.id : undefined;
            const isAsc = sorting.length > 0 ? !sorting[0]?.desc : undefined;

            const response = await getLocationTypes({
                filterBy,
                filterQuery,
                page: currentPage,
                size: pageSize,
                sortBy,
                isAsc,
            });

            setLocationTypes(response.items);
            setTotalItems(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error(err);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách location.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, columnFilters, sorting, toast]);

    useEffect(() => {
        if (isInitialMount.current) {
            fetchLocationTypes(); // Gọi lần đầu khi mount
            isInitialMount.current = false;
        } else {
            fetchLocationTypes(); // Gọi khi có thay đổi thực sự
        }
    }, [fetchLocationTypes, currentPage, pageSize, sorting, columnFilters]);

    const handleSuccess = () => {
        fetchLocationTypes();
        setDialogOpen(false);
        setSelectedDevice(undefined);
    };

    const handleEdit = (locationType: LocationType) => {
        setSelectedDevice(locationType);
        setDialogOpen(true);
    };

    const handleViewDetails = (locationType: LocationType) => {
        setDetailLocation(locationType);
        setDetailDialogOpen(true);
    };

    const handleDelete = (locationType: LocationType) => {
        setLocationTypeToDelete(locationType);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!locationTypeToDelete) return;
        try {
            await deleteLocationType(locationTypeToDelete.locationTypeId);
            toast({
                title: "Thành công",
                description: `Location "${locationTypeToDelete.name}" đã được xóa.`,
            });
            fetchLocationTypes();
        } catch (error) {
            console.error("Lỗi khi xóa location:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa location. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setLocationTypeToDelete(null);
        }
    };

    const handleAdd = () => {
        setSelectedDevice(undefined);
        setDialogOpen(true);
    };

    const clearAllFilters = () => {
        setStatusFilter("");
        setSearchValue("");
        table.resetColumnFilters();
    };

    const hasActiveFilters = statusFilter !== "" || searchValue !== "";

    const table = useReactTable({
        data: locationTypes,
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

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý location</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả các location pha cà phê tự động.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={loading} />
                        <RefreshButton loading={loading} toggleLoading={fetchLocationTypes} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <SearchInput
                            loading={loading}
                            placeHolderText="Tìm kiếm location..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
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
                                            {column.id === "locationId" ? "Mã location" :
                                                column.id === "name" ? "Tên location" : ""
                                                // column.id === "createdDate" ? "Ngày tạo" :
                                                //     column.id === "updatedDate" ? "Ngày cập nhật" : column.id
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
                                                {column.id === "locationTypeId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "name" ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-40" />
                                                    </div>
                                                    // ) : column.id === "status" ? (
                                                    //     <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                    // ) : column.id === "createdDate" || column.id === "updatedDate" ? (
                                                    //     <div className="flex items-center gap-2 justify-center">
                                                    //         <Skeleton className="h-4 w-4 rounded-full" />
                                                    //         <Skeleton className="h-5 w-24" />
                                                    //     </div>
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
                            ) : locationTypes.length ? (
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
                    loading={loading}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={totalItems}
                    totalPages={totalPages}
                />
            </div>
            <LocationTypeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleSuccess}
                locationType={selectedDevice}
            />
            <LocationTypeDetailDialog
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open);
                    if (!open) setDetailLocation(null);
                }}
                locationType={detailLocation}
            />
            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                description={`Bạn có chắc chắn muốn xóa location "${locationTypeToDelete?.name}"? Hành động này không thể hoàn tác.`}
                onConfirm={confirmDelete}
                onCancel={() => setLocationTypeToDelete(null)}
            />
        </div>
    );
};

export default ManageLocationTypes;