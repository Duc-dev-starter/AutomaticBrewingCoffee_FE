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
    PlusCircle,
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



const generateSampleRecipes = (count: number): Recipe[] => {
    // Danh mục đồ uống
    const beverageCategories = ["Cà phê", "Trà", "Nước ép & Sinh tố", "Đồ uống khác"];
    const difficulties: ("Dễ" | "Trung bình" | "Khó")[] = ["Dễ", "Trung bình", "Khó"]; // Độ khó vẫn có thể áp dụng (vd: pha chế phức tạp)
    const statuses: ("Đã xuất bản" | "Nháp" | "Đang xét duyệt")[] = ["Đã xuất bản", "Nháp", "Đang xét duyệt"];

    // Tên các loại đồ uống
    const beverageNames = [
        "Cà phê sữa đá", "Cà phê đen đá", "Bạc xỉu", "Cà phê trứng", "Espresso", "Latte", "Cappuccino",
        "Trà đào cam sả", "Trà tắc", "Trà chanh", "Trà sen vàng", "Trà sữa trân châu", "Trà ô long",
        "Nước cam ép", "Nước ép dứa", "Nước ép ổi", "Nước ép cà rốt", "Sinh tố bơ", "Sinh tố xoài", "Sinh tố dâu",
        "Nước mía", "Sữa đậu nành", "Nước sấu", "Nước mơ", "Soda chanh",
    ];

    // Mô tả tương ứng
    const beverageDescriptions = [
        "Cà phê đậm đà kết hợp sữa đặc ngọt ngào và đá mát lạnh.",
        "Hương vị cà phê đen nguyên chất, tỉnh táo tức thì.",
        "Vị cà phê nhẹ nhàng, nhiều sữa, phù hợp cho người mới bắt đầu.",
        "Đặc sản Hà Nội với lớp kem trứng béo ngậy, thơm lừng.",
        "Cốt cà phê Ý đậm đặc, nền tảng cho nhiều loại đồ uống.",
        "Espresso pha cùng nhiều sữa tươi nóng và lớp bọt mịn.",
        "Sự cân bằng giữa espresso, sữa nóng và bọt sữa dày.",
        "Trà đào thơm lừng, kết hợp vị chua thanh của cam và hương sả nồng ấm.",
        "Trà chua ngọt vị tắc (quất), giải nhiệt hiệu quả.",
        "Trà chanh chua ngọt, thức uống giải khát quen thuộc.",
        "Trà sen thanh mát, hương thơm dịu nhẹ.",
        "Trà sữa béo ngậy cùng trân châu dai dai, món tủ giới trẻ.",
        "Trà ô long lên men nhẹ, tốt cho sức khỏe.",
        "Nước cam tươi vắt nguyên chất, giàu vitamin C.",
        "Nước ép dứa chua ngọt tự nhiên, giúp tiêu hóa tốt.",
        "Nước ép ổi thơm đặc trưng, nhiều vitamin.",
        "Nước ép cà rốt bổ dưỡng cho mắt và da.",
        "Sinh tố bơ sánh mịn, béo ngậy, cung cấp năng lượng.",
        "Sinh tố xoài chín ngọt ngào, hương vị nhiệt đới.",
        "Sinh tố dâu tây chua ngọt, màu sắc hấp dẫn.",
        "Nước mía ép tươi nguyên chất, ngọt mát tự nhiên.",
        "Sữa đậu nành nhà làm, thơm ngon và bổ dưỡng.",
        "Nước sấu ngâm đường, thức uống giải khát mùa hè Hà Nội.",
        "Nước mơ ngâm chua ngọt, giải nhiệt, kích thích vị giác.",
        "Soda mát lạnh cùng vị chua của chanh tươi.",
    ];

    return Array.from({ length: count }, (_, i) => {
        const now = new Date();
        const randomDays = Math.floor(Math.random() * 30);
        const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
        const updateDate = new Date(date.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000);

        const randomIndex = Math.floor(Math.random() * beverageNames.length);
        const name = beverageNames[randomIndex];
        const description = beverageDescriptions[Math.floor(Math.random() * beverageDescriptions.length)];

        return {
            id: `DU-${Math.floor(10000 + Math.random() * 90000)}`, // Đổi tiền tố ID nếu muốn
            name: name,
            description: description,
            category: beverageCategories[Math.floor(Math.random() * beverageCategories.length)], // Chọn từ danh mục đồ uống
            difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
            prepTime: Math.floor(Math.random() * 14) + 2, // Thời gian chuẩn bị đồ uống thường ngắn hơn (2-15 phút)
            cookTime: Math.floor(Math.random() * 11),      // Thời gian nấu/pha chế (0-10 phút, vd: pha trà, cafe)
            servings: 1, // Đồ uống thường tính theo 1 phần ăn/ly
            createdAt: date.toISOString().split("T")[0],
            updatedAt: updateDate.toISOString().split("T")[0],
            // Thay đổi placeholder text
            imageUrl: `/placeholder.svg?height=100&width=200&text=${encodeURIComponent("Hình ảnh đồ uống")}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
        };
    });
};


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
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm
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

