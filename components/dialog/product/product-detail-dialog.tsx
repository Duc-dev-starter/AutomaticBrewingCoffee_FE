"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/interfaces/product";
import { format } from "date-fns";
import { EProductStatusViMap, EProductSizeViMap, EProductTypeViMap } from "@/enum/product";
import { formatCurrency } from "@/utils";

type ProductDetailDialogProps = {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const renderField = (label: string, value?: string | null) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm">
        <span className="w-40 shrink-0 font-semibold text-gray-500">{label}</span>
        <span className="text-gray-700">{value ?? "Không có"}</span>
    </div>
);

const ProductDetailDialog = ({ product, open, onOpenChange }: ProductDetailDialogProps) => {
    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết sản phẩm</DialogTitle>
                </DialogHeader>

                <DialogDescription asChild>
                    <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-4">
                        {renderField("Mã sản phẩm:", product.productId)}
                        {renderField("Tên sản phẩm:", product.name)}
                        {renderField("Mô tả:", product.description)}
                        {renderField("Tên sản phẩm cha:", product.productParentName)}
                        {renderField("Kích thước:", EProductSizeViMap[product.size])}
                        {renderField("Loại sản phẩm:", EProductTypeViMap[product.type])}
                        {renderField("Giá:", formatCurrency(product.price))}
                        {renderField("URL hình ảnh:", product.imageUrl)}
                        {renderField("Trạng thái:", EProductStatusViMap[product.status])}
                        {renderField("Hoạt động:", product.isActive ? "Có" : "Không")}
                        {renderField(
                            "Ngày tạo:",
                            product.createdDate
                                ? format(new Date(product.createdDate), "dd/MM/yyyy HH:mm")
                                : "Không có"
                        )}
                        {renderField(
                            "Ngày cập nhật:",
                            product.updatedDate
                                ? format(new Date(product.updatedDate), "dd/MM/yyyy HH:mm")
                                : "Chưa cập nhật"
                        )}
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailDialog;
