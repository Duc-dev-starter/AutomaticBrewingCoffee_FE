"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EBaseStatus } from "@/enum/base";
import { addProductToMenu } from "@/services/menu.service";
import { getProducts } from "@/services/product.service";
import { Product } from "@/interfaces/product";
import { ErrorResponse } from "@/types/error";

type AddProductToMenuDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    menuId: string;
    existingProductIds: string[];
};

const AddProductToMenuDialog = ({ open, onOpenChange, onSuccess, menuId, existingProductIds }: AddProductToMenuDialogProps) => {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<EBaseStatus>(EBaseStatus.Active);
    const [sellingPrice, setSellingPrice] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchProducts = async () => {
                try {
                    const response = await getProducts({ productType: "parent" });
                    const filteredProducts = response.items.filter(
                        (product: Product) => !existingProductIds.includes(product.productId)
                    );
                    setProducts(filteredProducts);
                } catch (error) {
                    console.error("Lỗi khi tải danh sách sản phẩm:", error);
                    toast({
                        title: "Lỗi",
                        description: "Không thể tải danh sách sản phẩm.",
                        variant: "destructive",
                    });
                }
            };
            fetchProducts();
        }
    }, [open, toast, existingProductIds]);

    useEffect(() => {
        if (selectedProductId) {
            const product = products.find((p) => p.productId === selectedProductId);
            setSelectedProduct(product || null);
        } else {
            setSelectedProduct(null);
        }
    }, [selectedProductId, products]);

    const handleSubmit = async () => {
        if (!selectedProductId) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn sản phẩm.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await addProductToMenu({
                menuId,
                productId: selectedProductId,
                status: selectedStatus,
                ...(sellingPrice !== undefined ? { sellingPrice } : {}),
            });
            toast({
                title: "Thành công",
                description: "Đã thêm sản phẩm vào menu.",
            });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý kiosk:", error);
            toast({
                title: "Lỗi khi thêm sản phẩm vào menu",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm sản phẩm vào menu</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="product">Sản phẩm</Label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger id="product">
                                <SelectValue placeholder="Chọn sản phẩm" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <SelectItem key={product.productId} value={product.productId}>
                                            {product.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-sm text-muted-foreground">
                                        Chưa có sản phẩm nào để thêm
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedProduct && (
                        <div className="grid gap-2 border-t pt-4">
                            <Label>Thông tin sản phẩm</Label>
                            <div className="flex gap-4">
                                {selectedProduct.imageUrl && (
                                    <img
                                        src={selectedProduct.imageUrl}
                                        alt={selectedProduct.name}
                                        className="h-16 w-16 rounded-md object-cover"
                                    />
                                )}
                                <div className="space-y-1">
                                    <p className="font-medium">{selectedProduct.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Giá: {selectedProduct.price.toLocaleString()} VNĐ
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Mô tả: {selectedProduct.description || "Chưa có"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="grid gap-2">
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as EBaseStatus)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={EBaseStatus.Active}>Hoạt động</SelectItem>
                                <SelectItem value={EBaseStatus.Inactive}>Không hoạt động</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sellingPrice">Giá bán (có thể để trống)</Label>
                        <input
                            type="number"
                            id="sellingPrice"
                            value={sellingPrice ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSellingPrice(value ? parseFloat(value) : undefined);
                            }}
                            placeholder="Nhập giá bán nếu muốn"
                            className="input input-bordered w-full rounded-md px-3 py-2 border border-input text-sm"
                        />
                    </div>

                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={loading}>
                        Thêm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddProductToMenuDialog;