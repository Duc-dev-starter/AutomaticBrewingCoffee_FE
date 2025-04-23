"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Info, PlusCircle, RefreshCw, Store, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, ConfirmDeleteDialog, ExportButton, RefreshButton } from "@/components/common";
import { Product } from "@/interfaces/product";
import { Menu, MenuProductMapping } from "@/interfaces/menu";
import { useToast } from "@/hooks/use-toast";
import { getMenu, removeProductFromMenu } from "@/services/menu";
import { columns } from "@/components/manage-menus-detail/columns";
import AddProductToMenuDialog from "@/components/dialog/menu/add-product-to-menu";
import { EBaseStatusViMap } from "@/enum/base";

export type MenuDetailType = Menu & {
    menuProductMappings: MenuProductMapping[];
};

const MenuDetail = () => {
    const params = useParams();
    const slug = params.slug as string;
    const { toast } = useToast();

    const [menu, setMenu] = useState<MenuDetailType | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
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

    const existingProductIds = menu ? menu.menuProductMappings.map((mapping) => mapping.product.productId) : [];

    // Dialog states
    const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
    const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Fetch menu data
    const fetchMenu = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMenu(slug);
            setMenu(response.response);
            const productList = response.response.menuProductMappings.map(
                (mapping: MenuProductMapping) => mapping.product
            );
            setProducts(productList);
            setTotalItems(productList.length);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu menu:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải dữ liệu menu.",
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
        let filtered = products.filter((product) =>
            product.name.toLowerCase().includes(searchValue.toLowerCase())
        );

        if (statusFilter !== "all") {
            filtered = filtered.filter((product) => product.status === statusFilter);
        }

        const total = Math.ceil(filtered.length / pageSize);
        setTotalPages(total);

        const startIndex = (currentPage - 1) * pageSize;
        const paginatedProducts = filtered.slice(startIndex, startIndex + pageSize);
        setFilteredProducts(paginatedProducts);
    }, [products, searchValue, statusFilter, currentPage, pageSize]);

    useEffect(() => {
        filterAndPaginateProducts();
    }, [filterAndPaginateProducts]);


    const handleFilterChange = () => setCurrentPage(1);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        handleFilterChange();
    };
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        handleFilterChange();
    };


    const handleAddProductSuccess = () => {
        fetchMenu();
        setAddProductDialogOpen(false);
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;
        try {
            await removeProductFromMenu(menu!.menuId, selectedProduct.productId);
            toast({ title: "Thành công", description: "Đã xóa sản phẩm khỏi menu." });
            fetchMenu();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa sản phẩm.",
                variant: "destructive",
            });
        } finally {
            setDeleteProductDialogOpen(false);
            setSelectedProduct(null);
        }
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setDeleteProductDialogOpen(true);
    };

    const toggleLoading = () => {
        fetchMenu();
    };

    if (loading && !menu) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!menu) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Menu không tồn tại</h2>
                    <p className="text-muted-foreground">
                        Không tìm thấy thông tin menu với mã {slug}
                    </p>
                </div>
            </div>
        );
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
                                                    <h3 className="text-xl font-semibold mb-4">
                                                        Thông tin Menu
                                                    </h3>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Mã menu:
                                                            </p>
                                                            <p className="font-medium">ORD-{menu.menuId.substring(0, 8)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Mã kiosk:
                                                            </p>
                                                            <p className="font-medium">KIO-{menu.kioskId.substring(0, 8)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Tên menu:
                                                            </p>
                                                            <p className="font-medium">{menu.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Địa chỉ kiosk:
                                                            </p>
                                                            <p className="font-medium">{menu.kiosk.location}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Mô tả:
                                                            </p>
                                                            <p className="font-medium">
                                                                {menu.description || "Không có"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Trạng thái:
                                                            </p>
                                                            <Badge
                                                                className={
                                                                    menu.status === "Active"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-gray-100 text-gray-800"
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
                                <p className="text-muted-foreground">
                                    Chưa có cửa hàng nào áp dụng menu này.
                                </p>
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
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchValue}
                            onChange={handleSearchChange}
                            className="pl-10"
                            disabled={loading}
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <Select
                            value={statusFilter}
                            onValueChange={handleStatusFilterChange}
                            disabled={loading}
                        >
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
                                <Button variant="outline" disabled={loading}>
                                    Cột <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {columns({ onDelete: handleDeleteClick }).map(
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
                                        )
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button onClick={() => setAddProductDialogOpen(true)} disabled={loading}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns({ onDelete: handleDeleteClick })
                                        .filter(
                                            (column) =>
                                                columnVisibility[column.id as keyof typeof columnVisibility]
                                        )
                                        .map((column) => (
                                            <TableHead
                                                key={column.id}
                                                className={
                                                    column.id === "price" || column.id === "actions"
                                                        ? "text-right"
                                                        : column.id === "order"
                                                            ? "text-center"
                                                            : ""
                                                }
                                            >
                                                {column.header as string}
                                            </TableHead>
                                        ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: pageSize }).map((_, index) => (
                                        <TableRow key={`skeleton-${index}`} className="animate-pulse">
                                            {columns({ onDelete: handleDeleteClick })
                                                .filter(
                                                    (column) =>
                                                        columnVisibility[column.id as keyof typeof columnVisibility]
                                                )
                                                .map((column) => (
                                                    <TableCell
                                                        key={`${column.id}-skeleton-${index}`}
                                                        className={
                                                            column.id === "price" || column.id === "actions"
                                                                ? "text-right"
                                                                : column.id === "order"
                                                                    ? "text-center"
                                                                    : ""
                                                        }
                                                    >
                                                        {column.id === "image" ? (
                                                            <Skeleton className="h-10 w-10 rounded-md" />
                                                        ) : column.id === "name" ? (
                                                            <Skeleton className="h-5 w-40" />
                                                        ) : column.id === "price" ? (
                                                            <Skeleton className="h-5 w-20 ml-auto" />
                                                        ) : column.id === "order" ? (
                                                            <Skeleton className="h-8 w-16 mx-auto rounded" />
                                                        ) : (
                                                            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.productId}>
                                            {columns({ onDelete: handleDeleteClick })
                                                .filter(
                                                    (column) =>
                                                        columnVisibility[column.id as keyof typeof columnVisibility]
                                                )
                                                .map((column) => (
                                                    <TableCell
                                                        key={`${column.id}-${product.productId}`}
                                                        className={
                                                            column.id === "price" || column.id === "actions"
                                                                ? "text-right"
                                                                : column.id === "order"
                                                                    ? "text-center"
                                                                    : ""
                                                        }
                                                    >
                                                        {column.cell && typeof column.cell === "function" ? (
                                                            column.cell({ row: { original: product } } as any)
                                                        ) : null}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                Object.values(columnVisibility).filter(Boolean).length
                                            }
                                            className="h-24 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <p className="text-lg font-medium">
                                                    Không tìm thấy sản phẩm
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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
                description={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}" khỏi menu? Hành động này không thể hoàn tác.`}
                onConfirm={handleDeleteProduct}
                onCancel={() => setSelectedProduct(null)}
            />
        </div>
    );
};

export default MenuDetail;