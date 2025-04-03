"use client"

import * as React from "react"
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
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    Users,
    Utensils,
    LayoutGrid,
    LayoutList,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { columns } from "@/components/manage-recipes/columns"
import { Recipe } from "@/types"
import { useRouter } from "next/navigation"
import ExportButton from "@/components/common/export-button"
import RefreshButton from "@/components/common/refresh-button"



// Dữ liệu mẫu
const generateSampleRecipes = (count: number): Recipe[] => {
    const categories = ["Bánh mì", "Món nước", "Món cuốn", "Cơm", "Món tráng miệng", "Đồ uống"]
    const difficulties: ("Dễ" | "Trung bình" | "Khó")[] = ["Dễ", "Trung bình", "Khó"]
    const statuses: ("Đã xuất bản" | "Nháp" | "Đang xét duyệt")[] = ["Đã xuất bản", "Nháp", "Đang xét duyệt"]
    const recipeNames = [
        "Bánh mì Việt Nam",
        "Phở bò",
        "Gỏi cuốn tôm thịt",
        "Bún chả Hà Nội",
        "Cơm tấm sườn bì chả",
        "Bánh xèo",
        "Chả giò",
        "Bún bò Huế",
        "Cà phê trứng",
        "Bánh cuốn",
        "Hủ tiếu Nam Vang",
        "Bún đậu mắm tôm",
        "Cơm rang dưa bò",
        "Canh chua cá lóc",
        "Gà nướng mật ong",
    ]
    const descriptions = [
        "Bánh mì giòn với nhân thịt và rau sống",
        "Phở bò truyền thống với nước dùng đậm đà",
        "Gỏi cuốn tươi mát với tôm, thịt và rau sống",
        "Bún chả với thịt nướng thơm lừng",
        "Cơm tấm với sườn nướng, bì và chả trứng",
        "Bánh xèo giòn với nhân tôm thịt và giá đỗ",
        "Món ăn truyền thống với hương vị đặc trưng",
        "Món ăn đặc sản miền Trung với vị cay nồng",
        "Thức uống đặc biệt với lớp kem trứng béo ngậy",
        "Bánh cuốn mỏng với nhân thịt thơm ngon",
    ]

    return Array.from({ length: count }, (_, i) => {
        const now = new Date()
        const randomDays = Math.floor(Math.random() * 30)
        const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
        const updateDate = new Date(date.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)

        return {
            id: `CT-${Math.floor(10000 + Math.random() * 90000)}`,
            name: recipeNames[Math.floor(Math.random() * recipeNames.length)],
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
            prepTime: Math.floor(Math.random() * 60) + 10,
            cookTime: Math.floor(Math.random() * 120) + 15,
            servings: Math.floor(Math.random() * 6) + 1,
            createdAt: date.toISOString().split("T")[0],
            updatedAt: updateDate.toISOString().split("T")[0],
            imageUrl: `/placeholder.svg?height=100&width=200&text=${encodeURIComponent("Hình ảnh công thức")}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
        }
    })
}



const ManageRecipes = () => {
    const [loading, setLoading] = React.useState(true)
    const [pageSize, setPageSize] = React.useState(10)
    const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")
    const router = useRouter();

    // Generate sample recipes
    const data = React.useMemo(() => generateSampleRecipes(50), [])

    // Simulate loading data
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1500) // Simulate 1.5 seconds loading time

        return () => clearTimeout(timer)
    }, [])

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: { pageSize: 10 },
        },
    })

    // Update table page size when pageSize state changes
    React.useEffect(() => {
        table.setPageSize(pageSize)
    }, [pageSize, table])

    // Calculate pagination information
    const totalItems = data.length
    const filteredItems = table.getFilteredRowModel().rows.length
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = Math.ceil(filteredItems / pageSize)
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, filteredItems)

    // For demo purposes - toggle loading state
    const toggleLoading = () => {
        setLoading((prev) => !prev)
    }

    // Xử lý thêm công thức mới
    const handleAddRecipe = () => {
        router.push("/recipe")
    }

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý công thức</h2>
                        <p className="text-muted-foreground">Quản lý và xem tất cả công thức nấu ăn của bạn.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={loading} />
                        <RefreshButton loading={loading} toggleLoading={toggleLoading} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm công thức..."
                            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                            className="pl-8"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="flex items-center border rounded-md overflow-hidden">
                            <Button
                                variant={viewMode === "table" ? "default" : "ghost"}
                                size="sm"
                                className="rounded-none h-9 px-3"
                                onClick={() => setViewMode("table")}
                                disabled={loading}
                            >
                                <LayoutList className="h-4 w-4 mr-2" />
                                Bảng
                            </Button>
                            <Separator orientation="vertical" className="h-9" />
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                className="rounded-none h-9 px-3"
                                onClick={() => setViewMode("grid")}
                                disabled={loading}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                Lưới
                            </Button>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto" disabled={loading}>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Lọc
                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Đã xuất bản")}>
                                    Đã xuất bản
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Nháp")}>
                                    Nháp
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Đang xét duyệt")}>
                                    Đang xét duyệt
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("")}>
                                    Xóa bộ lọc
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Lọc theo độ khó</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => table.getColumn("difficulty")?.setFilterValue("Dễ")}>
                                    Dễ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("difficulty")?.setFilterValue("Trung bình")}>
                                    Trung bình
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("difficulty")?.setFilterValue("Khó")}>
                                    Khó
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => table.getColumn("difficulty")?.setFilterValue("")}>
                                    Xóa bộ lọc
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={loading}>
                                    Cột <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id === "name"
                                                    ? "Tên công thức"
                                                    : column.id === "category"
                                                        ? "Danh mục"
                                                        : column.id === "difficulty"
                                                            ? "Độ khó"
                                                            : column.id === "time"
                                                                ? "Thời gian"
                                                                : column.id === "status"
                                                                    ? "Trạng thái"
                                                                    : column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleAddRecipe} disabled={loading}>
                            Thêm công thức
                        </Button>
                    </div>
                </div>

                {viewMode === "table" ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    // Skeleton loading state
                                    Array.from({ length: pageSize }).map((_, index) => (
                                        <TableRow key={`skeleton-${index}`} className="animate-pulse">
                                            {columns.map((column, cellIndex) => (
                                                <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                    {column.id === "name" ? (
                                                        <div className="flex items-center space-x-3">
                                                            <Skeleton className="h-10 w-10 rounded-md" />
                                                            <div>
                                                                <Skeleton className="h-5 w-32" />
                                                                <Skeleton className="h-3 w-40 mt-1" />
                                                            </div>
                                                        </div>
                                                    ) : column.id === "category" ? (
                                                        <Skeleton className="h-5 w-24" />
                                                    ) : column.id === "difficulty" ? (
                                                        <Skeleton className="h-6 w-20 rounded-full" />
                                                    ) : column.id === "time" ? (
                                                        <div className="flex items-center">
                                                            <Skeleton className="h-4 w-4 rounded-full mr-1" />
                                                            <Skeleton className="h-5 w-16" />
                                                        </div>
                                                    ) : column.id === "status" ? (
                                                        <Skeleton className="h-6 w-24 rounded-full" />
                                                    ) : column.id === "actions" ? (
                                                        <div className="flex justify-end">
                                                            <Skeleton className="h-8 w-8 rounded-full" />
                                                        </div>
                                                    ) : (
                                                        <Skeleton className="h-5 w-full" />
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            Không có kết quả.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            // Skeleton loading state for grid view
                            Array.from({ length: 6 }).map((_, index) => (
                                <Card key={`skeleton-card-${index}`} className="overflow-hidden animate-pulse">
                                    <div className="h-48 bg-muted"></div>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>
                                        <Skeleton className="h-4 w-full mt-1" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <Skeleton className="h-5 w-20" />
                                            <Skeleton className="h-5 w-20" />
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                    </CardContent>
                                    <Separator />
                                    <CardFooter className="pt-4">
                                        <Skeleton className="h-9 w-full rounded-md" />
                                    </CardFooter>
                                </Card>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const recipe = row.original as Recipe
                                return (
                                    <Card key={recipe.id} className="overflow-hidden">
                                        <div className="relative h-48">
                                            <img
                                                src={recipe.imageUrl || "/placeholder.svg"}
                                                alt={recipe.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                {recipe.status === "Đã xuất bản" ? (
                                                    <Badge className="bg-green-500">Đã xuất bản</Badge>
                                                ) : recipe.status === "Nháp" ? (
                                                    <Badge variant="outline">Nháp</Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-500">Đang xét duyệt</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-xl">{recipe.name}</CardTitle>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <ChevronDownIcon className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.push(`/recipe?id=${recipe.id}`)}>
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                if (confirm("Bạn có chắc chắn muốn xóa công thức này không?")) {
                                                                    console.log("Xóa công thức:", recipe.id)
                                                                }
                                                            }}
                                                        >
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{recipe.description}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <Utensils className="h-4 w-4 mr-1 text-muted-foreground" />
                                                    <span>{recipe.category}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                                    <span>{recipe.prepTime + recipe.cookTime} phút</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                                    <span>{recipe.servings} người</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <Separator />
                                        <CardFooter className="pt-4">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => router.push(`/recipe?id=${recipe.id}`)}
                                            >
                                                Xem & Chỉnh sửa
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            })
                        ) : (
                            <div className="col-span-full text-center py-12 border rounded-lg">
                                <p className="text-muted-foreground">Không có kết quả.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 py-4">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Hiển thị</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                setPageSize(Number(value))
                            }}
                            disabled={loading}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 20, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm font-medium">mục mỗi trang</p>
                    </div>

                    {loading ? (
                        <Skeleton className="h-5 w-64" />
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Đang hiển thị {filteredItems > 0 ? startItem : 0} đến {endItem} trong tổng số {filteredItems} mục
                            {filteredItems !== totalItems && ` (đã lọc từ ${totalItems} mục)`}
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage() || loading}
                        >
                            <span className="sr-only">Trang đầu</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || loading}
                        >
                            <span className="sr-only">Trang trước</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {loading ? (
                            <Skeleton className="h-5 w-16" />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium">Trang {currentPage}</span>
                                <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || loading}
                        >
                            <span className="sr-only">Trang sau</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage() || loading}
                        >
                            <span className="sr-only">Trang cuối</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageRecipes

