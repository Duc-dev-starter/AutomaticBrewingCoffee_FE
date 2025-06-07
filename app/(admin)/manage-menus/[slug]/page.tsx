"use client"

import type React from "react"
import { useParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Info, PlusCircle, Store } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, ConfirmDeleteDialog, ExportButton, RefreshButton } from "@/components/common"
import type { Menu, MenuProductMapping } from "@/interfaces/menu"
import { useToast } from "@/hooks/use-toast"
import { getMenu, removeProductFromMenu, reorderMenuProducts } from "@/services/menu"
import { columns } from "@/components/manage-menus-detail/columns"
import AddProductToMenuDialog from "@/components/dialog/menu/add-product-to-menu"
import { EBaseStatusViMap } from "@/enum/base"
import { SearchInput } from "@/components/common/search-input"
import { ErrorResponse } from "@/types/error"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export type MenuDetailType = Menu & {
    menuProductMappings: MenuProductMapping[]
}

const MenuDetail = () => {
    const params = useParams();
    const slug = params.slug as string;
    const { toast } = useToast();

    const [menu, setMenu] = useState<MenuDetailType | null>(null);
    const [filteredMappings, setFilteredMappings] = useState<MenuProductMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [productTypeFilter, setProductTypeFilter] = useState<string>("");
    const [productSizeFilter, setProductSizeFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [columnVisibility, setColumnVisibility] = useState({
        image: true,
        name: true,
        price: true,
        order: true,
        actions: true,
    });

    const existingProductIds = (menu
        ? menu.menuProductMappings.map((mapping) => mapping.product?.productId).filter(Boolean)
        : []) as string[];

    const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
    const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState<MenuProductMapping | null>(null);

    const fetchMenu = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMenu(slug);
            setMenu(response.response);
            setTotalItems(response.response.menuProductMappings.length);
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi lấy danh sách menu:", err);
            toast({
                title: "Lỗi khi lấy danh sách menu",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [slug, toast]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const filterAndPaginateProducts = useCallback(() => {
        if (!menu) return;

        let filtered = menu.menuProductMappings.filter(
            (mapping) => mapping.product !== null
        );

        filtered = filtered.filter((mapping) =>
            mapping.product?.name.toLowerCase().includes(searchValue.toLowerCase())
        );

        if (statusFilter !== "" && statusFilter !== "all") {
            filtered = filtered.filter((mapping) => mapping.product?.status === statusFilter);
        }

        if (productTypeFilter !== "" && productTypeFilter !== "all") {
            filtered = filtered.filter((mapping) => mapping.product?.type === productTypeFilter);
        }

        if (productSizeFilter !== "" && productSizeFilter !== "all") {
            filtered = filtered.filter((mapping) => mapping.product?.size === productSizeFilter);
        }

        filtered.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        const total = Math.ceil(filtered.length / pageSize);
        setTotalPages(total);

        const startIndex = (currentPage - 1) * pageSize;
        const paginatedMappings = filtered.slice(startIndex, startIndex + pageSize);
        setFilteredMappings(paginatedMappings);
    }, [menu, searchValue, statusFilter, productTypeFilter, productSizeFilter, currentPage, pageSize]);

    useEffect(() => {
        filterAndPaginateProducts();
    }, [filterAndPaginateProducts]);

    const handleFilterChange = () => setCurrentPage(1);

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        handleFilterChange();
    };

    const handleAddProductSuccess = () => {
        fetchMenu();
        setAddProductDialogOpen(false);
    };

    const handleDeleteProduct = async () => {
        if (!selectedMapping || !selectedMapping.product) return;
        try {
            await removeProductFromMenu(menu!.menuId, selectedMapping.product.productId);
            toast({ title: "Thành công", description: "Đã xóa sản phẩm khỏi menu." });
            fetchMenu();
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xóa sản phẩm:", err);
            toast({
                title: "Lỗi khi xóa sản phẩm",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setDeleteProductDialogOpen(false);
            setSelectedMapping(null);
        }
    };

    const handleDeleteClick = (mapping: MenuProductMapping) => {
        setSelectedMapping(mapping);
        setDeleteProductDialogOpen(true);
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination || !menu) return;

        const items = Array.from(filteredMappings);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFilteredMappings(items);

        const dragProductId = reorderedItem.product?.productId;
        let targetProductId: string | null = null;
        let insertAfter: boolean = false;

        if (result.destination.index === 0) {
            // Thả ở đầu danh sách
            // @ts-ignore
            targetProductId = items[1]?.product?.productId; // Sản phẩm thứ hai (nếu có)
            insertAfter = false; // Chèn trước sản phẩm đầu tiên
        } else if (result.destination.index === items.length - 1) {
            // Thả ở cuối danh sách
            // @ts-ignore
            targetProductId = items[items.length - 2]?.product?.productId; // Sản phẩm áp cuối
            insertAfter = true; // Chèn sau sản phẩm cuối cùng
        } else {
            // Thả ở giữa danh sách
            const prevItem = items[result.destination.index - 1];
            // @ts-ignore
            targetProductId = prevItem.product?.productId; // Chọn sản phẩm trước đó làm mục tiêu
            insertAfter = true; // Chèn sau sản phẩm trước đó
        }

        if (targetProductId && dragProductId) {
            try {
                await reorderMenuProducts(menu.menuId, {
                    dragProductId,
                    targetProductId,
                    insertAfter,
                });
                toast({ title: "Thành công", description: "Đã cập nhật thứ tự sản phẩm." });
                fetchMenu(); // Tải lại dữ liệu từ server để đồng bộ
            } catch (error: unknown) {
                const err = error as ErrorResponse;
                console.error("Lỗi khi cập nhật thứ tự:", err);
                toast({
                    title: "Lỗi khi cập nhật thứ tự",
                    description: err.message,
                    variant: "destructive",
                });
                setFilteredMappings(menu.menuProductMappings); // Hoàn nguyên nếu lỗi
            }
        }
    };

    const toggleLoading = () => {
        fetchMenu();
    };

    const clearAllFilters = () => {
        setStatusFilter("");
        setProductTypeFilter("");
        setProductSizeFilter("");
        setSearchValue("");
    };

    if (loading && !menu) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="mb-8">
                    <Skeleton className="h-10 w-64 mb-6" />
                    <div className="w-full">
                        <div className="mb-6">
                            <Skeleton className="h-10 w-full mb-6" />
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-6 w-full">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <Skeleton className="h-8 w-48 mb-4" />
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {Array.from({ length: 6 }).map((_, index) => (
                                                                <div key={index}>
                                                                    <Skeleton className="h-4 w-24 mb-2" />
                                                                    <Skeleton className="h-6 w-32" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Skeleton className="h-10 w-32" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                        <Skeleton className="h-10 w-72" />
                        <div className="flex items-center gap-2 ml-auto">
                            <Skeleton className="h-10 w-44" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <TableHead key={index}>
                                                <Skeleton className="h-6 w-full" />
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                                        <TableRow key={`skeleton-row-${rowIndex}`} className="animate-pulse">
                                            <TableCell>
                                                <Skeleton className="h-10 w-10 rounded-md" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-40" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-5 w-20 ml-auto" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-8 w-16 mx-auto rounded" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <div className="mt-4">
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!menu) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Menu không tồn tại</h2>
                    <p className="text-muted-foreground">Không tìm thấy thông tin menu với mã {slug}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Chi tiết menu {menu.name}</h1>
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="info" className="flex items-center">
                            <Info className="mr-2 h-4 w-4" />
                            Thông Tin Chung
                        </TabsTrigger>
                        <TabsTrigger value="stores" className="flex items-center">
                            <Store className="mr-2 h-4 w-4" />
                            Cửa Hàng Áp Dụng
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-6 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4">Thông tin Menu</h3>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Mã menu:</p>
                                                            <p className="font-medium">ORD-{menu.menuId.substring(0, 8)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Mã kiosk:</p>
                                                            <p className="font-medium">KIO-{menu.kioskId.substring(0, 8)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Tên menu:</p>
                                                            <p className="font-medium">{menu.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Địa chỉ kiosk:</p>
                                                            <p className="font-medium">{menu.kiosk.location}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Mô tả:</p>
                                                            <p className="font-medium">{menu.description || "Không có"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Trạng thái:</p>
                                                            <Badge
                                                                className={
                                                                    menu.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                                                }
                                                            >
                                                                {EBaseStatusViMap[menu.status] || "Không rõ"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="flex items-center">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Cập Nhật
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="stores">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground">Chưa có cửa hàng nào áp dụng menu này.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả sản phẩm trong menu.</p>
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
                            placeHolderText="Tìm kiếm sản phẩm..."
                            searchValue={searchValue}
                            setSearchValue={(value) => {
                                setSearchValue(value)
                                handleFilterChange()
                            }}
                            className="border-gray-200 dark:border-gray-700"
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="Selling">Đang bán</SelectItem>
                                <SelectItem value="Inactive">Không hoạt động</SelectItem>
                            </SelectContent>
                        </Select>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Cột <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {columns({ onDelete: handleDeleteClick, onOrderChange: () => { } }).map(
                                    (column) =>
                                        column.enableHiding && (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                checked={columnVisibility[column.id as keyof typeof columnVisibility]}
                                                onCheckedChange={(value) =>
                                                    setColumnVisibility({
                                                        ...columnVisibility,
                                                        [column.id as string]: !!value,
                                                    })
                                                }
                                            >
                                                {column.header as string}
                                            </DropdownMenuCheckboxItem>
                                        ),
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => setAddProductDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {columns({ onDelete: handleDeleteClick, onOrderChange: () => { } }).filter(
                                            (column) => columnVisibility[column.id as keyof typeof columnVisibility]
                                        ).map((column) => (
                                            <TableHead key={column.id} className="text-center">
                                                {column.header as string}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <Droppable droppableId="products">
                                    {(provided) => (
                                        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                            {loading ? (
                                                Array.from({ length: pageSize }).map((_, index) => (
                                                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                                                        {columns({ onDelete: handleDeleteClick, onOrderChange: () => { } })
                                                            .filter((column) => columnVisibility[column.id as keyof typeof columnVisibility])
                                                            .map((column) => (
                                                                <TableCell
                                                                    key={`${column.id}-skeleton-${index}`}
                                                                    className="text-center"
                                                                >
                                                                    {column.id === "image" ? (
                                                                        <Skeleton className="h-10 w-10 rounded-md mx-auto" />
                                                                    ) : column.id === "name" ? (
                                                                        <Skeleton className="h-5 w-40 mx-auto" />
                                                                    ) : column.id === "price" ? (
                                                                        <Skeleton className="h-5 w-20 mx-auto" />
                                                                    ) : column.id === "order" ? (
                                                                        <Skeleton className="h-8 w-16 mx-auto rounded" />
                                                                    ) : (
                                                                        <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                    </TableRow>
                                                ))
                                            ) : filteredMappings.length > 0 ? (
                                                filteredMappings.map((mapping, index) => (
                                                    <Draggable
                                                        key={mapping.product?.productId || mapping.productId}
                                                        draggableId={mapping.product?.productId || mapping.productId || index.toString()}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <TableRow
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {columns({ onDelete: handleDeleteClick, onOrderChange: () => { } })
                                                                    .filter((column) => columnVisibility[column.id as keyof typeof columnVisibility])
                                                                    .map((column) => (
                                                                        <TableCell
                                                                            key={`${column.id}-${mapping.product?.productId || mapping.productId}`}
                                                                            className="text-center"
                                                                        >
                                                                            {column.cell && typeof column.cell === "function"
                                                                                ? column.cell({ row: { original: mapping } } as any)
                                                                                : null}
                                                                        </TableCell>
                                                                    ))}
                                                            </TableRow>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={Object.values(columnVisibility).filter(Boolean).length}
                                                        className="h-24 text-center"
                                                    >
                                                        <div className="flex flex-col items-center justify-center text-center">
                                                            <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {provided.placeholder}
                                        </TableBody>
                                    )}
                                </Droppable>
                            </Table>
                        </DragDropContext>
                    </CardContent>
                </Card>
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
            <AddProductToMenuDialog
                open={addProductDialogOpen}
                onOpenChange={setAddProductDialogOpen}
                onSuccess={handleAddProductSuccess}
                menuId={menu.menuId}
                existingProductIds={existingProductIds}
            />
            <ConfirmDeleteDialog
                open={deleteProductDialogOpen}
                onOpenChange={setDeleteProductDialogOpen}
                description={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedMapping?.product?.name || "Không có tên"}" khỏi menu? Hành động này không thể hoàn tác.`}
                onConfirm={handleDeleteProduct}
                onCancel={() => setSelectedMapping(null)}
            />
        </div>
    );
};

export default MenuDetail;