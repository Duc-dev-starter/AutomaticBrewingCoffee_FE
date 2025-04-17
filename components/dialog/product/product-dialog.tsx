"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/interfaces/product";
import { EProductStatus, EProductSize, EProductType } from "@/enum/product";
import { createProduct, updateProduct, getProducts } from "@/services/product";
import { productSchema } from "@/schema/product";

type ProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    product?: Product;
}

const initialFormData = {
    name: "",
    description: "",
    parentId: "",
    size: EProductSize.M,
    type: EProductType.Single,
    status: EProductStatus.Selling,
    price: "",
    imageUrl: "",
    isActive: true,
};

const ProductDialog = ({ open, onOpenChange, onSuccess, product }: ProductDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    // Fetch products for parentId selection
    useEffect(() => {
        const fetchProducts = async () => {
            setFetching(true);
            try {
                const response = await getProducts({ page: 1, size: 100 });
                setProducts(response.items);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách sản phẩm.",
                    variant: "destructive",
                });
            } finally {
                setFetching(false);
            }
        };
        if (open) {
            fetchProducts();
        }
    }, [open, toast]);

    // Populate form data when editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || "",
                parentId: product.parentId || "",
                size: product.size,
                type: product.type,
                status: product.status,
                price: product.price.toString(),
                imageUrl: product.imageUrl || "",
                isActive: product.isActive,
            });
            setErrors({});
        }
    }, [product]);

    // Reset form data and errors when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setErrors({});
            setProducts([]);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const validationResult = productSchema.safeParse(formData);
        if (!validationResult.success) {
            console.error("Validation errors:", validationResult.error.errors);
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            setErrors(
                Object.fromEntries(
                    Object.entries(fieldErrors).map(([key, messages]) => [key, messages ? messages[0] : ""])
                )
            );
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                parentId: formData.parentId || undefined,
                size: formData.size,
                type: formData.type,
                status: formData.status,
                price: Number(formData.price),
                imageUrl: formData.imageUrl || undefined,
                isActive: formData.isActive,
            };
            if (product) {
                await updateProduct(product.productId, data);
                toast({
                    title: "Thành công",
                    description: `Sản phẩm "${formData.name}" đã được cập nhật.`,
                });
            } else {
                await createProduct(data);
                toast({
                    title: "Thành công",
                    description: `Sản phẩm "${formData.name}" đã được tạo.`,
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Lỗi:", error);
            toast({
                title: "Lỗi",
                description: product ? "Không thể cập nhật sản phẩm." : "Không thể tạo sản phẩm.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Prevent Enter key from closing dialog
    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.stopPropagation();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="name">Tên sản phẩm</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập tên sản phẩm"
                                disabled={loading}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="parentId">Sản phẩm cha</Label>
                            <Select
                                value={formData.parentId}
                                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                                disabled={loading || fetching}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn sản phẩm cha (tùy chọn)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.productId} value={p.productId}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.parentId && <p className="text-red-500 text-sm">{errors.parentId}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="size">Kích thước</Label>
                            <Select
                                value={formData.size}
                                onValueChange={(value) => setFormData({ ...formData, size: value as EProductSize })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn kích thước" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EProductSize.S}>Nhỏ</SelectItem>
                                    <SelectItem value={EProductSize.M}>Trung</SelectItem>
                                    <SelectItem value={EProductSize.L}>Lớn</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.size && <p className="text-red-500 text-sm">{errors.size}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="type">Loại sản phẩm</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as EProductType })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại sản phẩm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EProductType.Single}>Đơn</SelectItem>
                                    <SelectItem value={EProductType.Parent}>Cha</SelectItem>
                                    <SelectItem value={EProductType.Child}>Con</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as EProductStatus })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EProductStatus.Selling}>Đang bán</SelectItem>
                                    <SelectItem value={EProductStatus.UnSelling}>Ngừng bán</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="price">Giá (VNĐ)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)) {
                                        setFormData({ ...formData, price: value });
                                    }
                                }}
                                placeholder="Nhập giá sản phẩm"
                                disabled={loading}
                            />
                            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="imageUrl">URL hình ảnh</Label>
                            <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="Nhập URL hình ảnh (tùy chọn)"
                                disabled={loading}
                            />
                            {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="isActive">Hoạt động</Label>
                            <Select
                                value={formData.isActive.toString()}
                                onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái hoạt động" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Hoạt động</SelectItem>
                                    <SelectItem value="false">Không hoạt động</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.isActive && <p className="text-red-500 text-sm">{errors.isActive}</p>}
                        </div>
                        <div className="grid gap-2 col-span-1 sm:col-span-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Nhập mô tả sản phẩm (tùy chọn)"
                                disabled={loading}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading || fetching}>
                            {product ? "Cập nhật" : "Thêm"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDialog;