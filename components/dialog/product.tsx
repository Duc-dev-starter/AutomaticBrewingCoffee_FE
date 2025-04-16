import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Product } from "@/types/product"; // Import interface Product
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface ProductDetailDialogProps {
    product: Product;
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({ product }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <span className="h-4 w-4">🔍</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Chi tiết sản phẩm</DialogTitle>
                <DialogDescription>
                    <div className="flex gap-4">
                        <img src={product.imageUrl} alt={product.name} className="w-32 h-32 object-cover" />
                        <div>
                            <h3 className="font-bold">{product.name}</h3>
                            <p>{product.description}</p>
                            <p><strong>Giá: </strong>{product.price} VND</p>
                            <p><strong>Kích cỡ: </strong>{product.size}</p>
                            <p><strong>Loại: </strong>{product.type}</p>
                            <p><strong>Ngày tạo: </strong>{format(new Date(product.createdDate), "dd/MM/yyyy")}</p>
                            <p><strong>Trạng thái: </strong>{product.isActive ? "Active" : "Inactive"}</p>
                        </div>
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailDialog;
