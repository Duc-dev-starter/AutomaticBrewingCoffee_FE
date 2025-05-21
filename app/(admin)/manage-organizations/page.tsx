"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { ChevronDownIcon } from "@radix-ui/react-icons"
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
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import useDebounce from "@/hooks/use-debounce"
import {
    ConfirmDeleteDialog,
    BaseStatusFilter,
    ExportButton,
    NoResultsRow,
    Pagination,
    RefreshButton,
    SearchInput,
} from "@/components/common"
import { getOrganizations, deleteOrganization } from "@/services/organization"
import type { Organization } from "@/interfaces/organization"
import { multiSelectFilter } from "@/utils/table"
import { useToast } from "@/hooks/use-toast"
import { columns } from "@/components/manage-organizations/columns"
import { OrganizationDetailDialog, OrganizationDialog } from "@/components/dialog/organization"
import { BaseFilterBadges } from "@/components/common/base-filter-badges"
import { ErrorResponse } from "@/types/error"

const ManageOrganizations = () => {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const [statusFilter, setStatusFilter] = useState<string>("")
    const [searchValue, setSearchValue] = useState("")
    const debouncedSearchValue = useDebounce(searchValue, 500)

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | undefined>(undefined)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [detailOrganization, setDetailOrganization] = useState<Organization | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null)

    const isInitialMount = useRef(true)

    const hasActiveFilters = statusFilter !== "" || searchValue !== ""

    // Đồng bộ cả searchValue và statusFilter với columnFilters
    useEffect(() => {
        if (isInitialMount.current) {
            return // Bỏ qua lần đầu khi mount
        }
        table.getColumn("name")?.setFilterValue(debouncedSearchValue || undefined)
        table.getColumn("status")?.setFilterValue(statusFilter || undefined)
    }, [debouncedSearchValue, statusFilter])

    const fetchOrganizations = useCallback(async () => {
        try {
            setLoading(true)

            const nameFilter = columnFilters.find((filter) => filter.id === "name")
            const filterBy = nameFilter ? "name" : undefined
            const filterQuery = nameFilter?.value as string | undefined

            const statusFilterValue = columnFilters.find((filter) => filter.id === "status")?.value as string | undefined

            const sortBy = sorting.length > 0 ? sorting[0]?.id : undefined
            const isAsc = sorting.length > 0 ? !sorting[0]?.desc : undefined

            const response = await getOrganizations({
                filterBy,
                filterQuery,
                page: currentPage,
                size: pageSize,
                sortBy,
                isAsc,
                status: statusFilterValue,
            })

            setOrganizations(response.items)
            setTotalItems(response.total)
            setTotalPages(response.totalPages)
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi lấy danh sách tổ chức:", err);
            toast({
                title: "Lỗi khi lấy danh sách tổ chức",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, columnFilters, sorting, toast])

    // Gọi fetchOrganizations khi mount và khi có thay đổi
    useEffect(() => {
        if (isInitialMount.current) {
            fetchOrganizations() // Gọi lần đầu khi mount
            isInitialMount.current = false
        } else {
            fetchOrganizations() // Gọi khi có thay đổi thực sự
        }
    }, [fetchOrganizations])

    const handleSuccess = () => {
        fetchOrganizations()
        setDialogOpen(false)
        setSelectedOrganization(undefined)
    }

    const handleEdit = (organization: Organization) => {
        setSelectedOrganization(organization)
        setDialogOpen(true)
    }

    const handleViewDetails = (organization: Organization) => {
        setDetailOrganization(organization)
        setDetailDialogOpen(true)
    }

    const handleDelete = (organization: Organization) => {
        setOrganizationToDelete(organization)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!organizationToDelete) return
        try {
            await deleteOrganization(organizationToDelete.organizationId)
            toast({
                title: "Thành công",
                description: `Tổ chức "${organizationToDelete.name}" đã được xóa.`,
            })
            fetchOrganizations()
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xóa tổ chức:", err);
            toast({
                title: "Lỗi khi xóa tổ chức",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false)
            setOrganizationToDelete(null)
        }
    }

    const handleAdd = () => {
        setSelectedOrganization(undefined)
        setDialogOpen(true)
    }

    const clearAllFilters = () => {
        setStatusFilter("")
        setSearchValue("")
        table.resetColumnFilters()
    }

    const table = useReactTable({
        data: organizations,
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
    })

    useEffect(() => {
        table.setPageSize(pageSize)
    }, [pageSize, table])

    const toggleLoading = () => {
        fetchOrganizations()
    }

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý tổ chức</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả tổ chức.</p>
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
                            placeHolderText="Tìm kiếm tên tổ chức..."
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
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {{
                                                organizationId: "Mã tổ chức",
                                                organizationCode: "Code tổ chức",
                                                logoUrl: "Logo",
                                                name: "Tên tổ chức",
                                                contactInfo: "Thông tin liên hệ",
                                                taxId: "Mã số thuế",
                                                status: "Trạng thái",
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
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() ? (header.column.getIsSorted() === "asc" ? " ↑" : " ↓") : null}
                                                </Button>
                                            ) : (
                                                flexRender(header.column.columnDef.header, header.getContext())
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
                                        {columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { } }).map(
                                            (column, cellIndex) => (
                                                <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                    {column.id === "organizationId" ? (
                                                        <Skeleton className="h-5 w-24 mx-auto" />
                                                    ) : column.id === "organizationCode" ? (
                                                        <Skeleton className="h-5 w-24 mx-auto" />
                                                    ) : column.id === "logoUrl" ? (
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <Skeleton className="h-4 w-4 rounded-full" />
                                                            <Skeleton className="h-5 w-40" />
                                                        </div>
                                                    ) : column.id === "name" ? (
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <Skeleton className="h-4 w-4 rounded-full" />
                                                            <Skeleton className="h-5 w-40" />
                                                        </div>
                                                    ) : column.id === "contactInfo" ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-4 w-24" />
                                                        </div>
                                                    ) : column.id === "taxId" ? (
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <Skeleton className="h-4 w-4 rounded-full" />
                                                            <Skeleton className="h-5 w-24" />
                                                        </div>
                                                    ) : column.id === "status" ? (
                                                        <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                    ) : column.id === "actions" ? (
                                                        <div className="flex justify-center">
                                                            <Skeleton className="h-8 w-8 rounded-full" />
                                                        </div>
                                                    ) : (
                                                        <Skeleton className="h-5 w-full" />
                                                    )}
                                                </TableCell>
                                            ),
                                        )}
                                    </TableRow>
                                ))
                            ) : organizations.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
            <OrganizationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleSuccess}
                organization={selectedOrganization}
            />
            <OrganizationDetailDialog
                open={detailDialogOpen}
                onOpenChange={(open) => {
                    setDetailDialogOpen(open)
                    if (!open) setDetailOrganization(null)
                }}
                organization={detailOrganization}
            />
            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                description={`Bạn có chắc chắn muốn xóa tổ chức "${organizationToDelete?.name}"? Hành động này không thể hoàn tác.`}
                onConfirm={confirmDelete}
                onCancel={() => setOrganizationToDelete(null)}
            />
        </div>
    )
}

export default ManageOrganizations
