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
import { columns } from "@/components/manage-workflows/columns";
import { Workflow } from "@/interfaces/workflow";
import { getWorkflows, deleteWorkflow } from "@/services/workflow";
import useDebounce from "@/hooks/use-debounce";
import { ConfirmDeleteDialog, BaseStatusFilter, ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { multiSelectFilter } from "@/utils/table";
import { useToast } from "@/hooks/use-toast";
import { FilterBadges } from "@/components/manage-workflows/filter-badges";
import { useRouter } from "next/navigation";
import { ErrorResponse } from "@/types/error";

const ManageWorkflows = () => {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string>("");

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);

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
        table.getColumn("type")?.setFilterValue(typeFilter || undefined);
    }, [debouncedSearchValue, typeFilter]);

    const fetchWorkflows = useCallback(async () => {
        try {
            setLoading(true);

            const nameFilter = columnFilters.find((filter) => filter.id === "name");
            const filterBy = nameFilter ? "name" : undefined;
            const filterQuery = nameFilter?.value as string | undefined;

            const typeFilterValue = columnFilters.find((filter) => filter.id === "type")?.value as string | undefined;

            const sortBy = sorting.length > 0 ? sorting[0]?.id : undefined;
            const isAsc = sorting.length > 0 ? !sorting[0]?.desc : undefined;

            const response = await getWorkflows({
                filterBy,
                filterQuery,
                page: currentPage,
                size: pageSize,
                sortBy,
                isAsc,
                type: typeFilterValue,
            });

            setWorkflows(response.items);
            setTotalItems(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error(err);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách quy trình.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, columnFilters, sorting, toast]);

    // Chỉ gọi fetchWorkflows khi mount và khi các giá trị thay đổi
    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);


    const handleEdit = (workflow: Workflow) => {
        router.push(`/update-workflow/${workflow.workflowId}`);
    };

    const handleViewDetails = (workflow: Workflow) => {
        router.push(`/manage-workflows/${workflow.workflowId}`);
    };

    const handleDelete = (workflow: Workflow) => {
        setWorkflowToDelete(workflow);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!workflowToDelete) return;
        try {
            await deleteWorkflow(workflowToDelete.workflowId);
            toast({
                title: "Thành công",
                description: `Quy trình "${workflowToDelete.name}" đã được xóa.`,
            });
            fetchWorkflows();
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xóa quy trình:", err);
            toast({
                title: "Lỗi khi xóa quy trình",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setWorkflowToDelete(null);
        }
    };

    const handleAdd = () => {
        router.push("/create-workflow");
    };

    const clearAllFilters = () => {
        setTypeFilter("");
        setSearchValue("");
        table.resetColumnFilters();
    };

    const hasActiveFilters = typeFilter !== "" || searchValue !== "";

    const table = useReactTable({
        data: workflows,
        columns: columns({
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onViewSteps: (workflow: Workflow) => router.push(`/manage-workflows/${workflow.workflowId}`),
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
        setCurrentPage(1);
    }, [columnFilters]);


    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý quy trình</h2>
                        <p className="text-muted-foreground">Quản lý các quy trình pha chế tự động.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={loading} />
                        <RefreshButton loading={loading} toggleLoading={fetchWorkflows} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <SearchInput
                            loading={loading}
                            placeHolderText="Tìm kiếm quy trình..."
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
                                            {column.id === "workflowId" ? "Mã quy trình" :
                                                column.id === "name" ? "Tên quy trình" :
                                                    column.id === "type" ? "Loại" :
                                                        column.id === "description" ? "Mô tả" :
                                                            column.id === "steps" ? "Bước" :
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

                <FilterBadges
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
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
                                        {columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { }, onViewSteps: () => { } }).map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "workflowId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "name" ? (
                                                    <Skeleton className="h-5 w-40 mx-auto" />
                                                ) : column.id === "type" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "description" ? (
                                                    <Skeleton className="h-5 w-48 mx-auto" />
                                                ) : column.id === "steps" ? (
                                                    <Skeleton className="h-5 w-20 mx-auto" />
                                                ) : column.id === "actions" ? (
                                                    <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                                                ) : (
                                                    <Skeleton className="h-5 w-full" />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : workflows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-center">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <NoResultsRow columns={columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { }, onViewSteps: () => { } })} />
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
            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                description={`Bạn có chắc chắn muốn xóa quy trình "${workflowToDelete?.name}"? Hành động này không thể hoàn tác.`}
                onConfirm={confirmDelete}
                onCancel={() => setWorkflowToDelete(null)}
            />
        </div>
    );
};

export default ManageWorkflows;