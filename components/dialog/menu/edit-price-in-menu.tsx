import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuProductMapping } from "@/interfaces/menu";
import { updateProductToMenu } from "@/services/menu.service";
import { useToast } from "@/hooks/use-toast";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";

interface EditPriceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mapping: MenuProductMapping | null;
    menuId: string;
    onSuccess: () => void;
}

const EditPriceDialog = ({ open, onOpenChange, mapping, menuId, onSuccess }: EditPriceDialogProps) => {
    const [price, setPrice] = useState(mapping?.product?.price?.toString() || "");
    const [status, setStatus] = useState(mapping?.status || EBaseStatus.Active);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!mapping?.product?.productId) return;

        const newPrice = parseFloat(price);
        if (isNaN(newPrice) || newPrice <= 0) {
            toast({ title: "Lỗi", description: "Giá phải là một số dương.", variant: "destructive" });
            return;
        }

        try {
            await updateProductToMenu(menuId, mapping.product.productId, {
                status: status,
                sellingPrice: price,
            });
            toast({ title: "Thành công", description: "Đã cập nhật giá và trạng thái sản phẩm." });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể cập nhật thông tin.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa thông tin sản phẩm: {mapping?.product?.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium">Giá mới (VND)</label>
                        <Input
                            id="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Nhập giá mới"
                            min="0"
                        />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium">Trạng thái</label>
                        <Select value={status} onValueChange={(value) => setStatus(value as EBaseStatus)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSave}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default EditPriceDialog;