"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EOrderType, EPaymentGateway } from "@/enum/order";
import { createOrder } from "@/services/order";
import { orderSchema } from "@/schema/order";

type OrderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};


// Initial form data
const initialFormData = {
    discount: "",
    feeAmount: "",
    feeDescription: "",
    orderType: EOrderType.Immediate,
    paymentGateway: EPaymentGateway.MoMo,
    sessionId: "",
    callbackUrl: "",
    orderDetails: [{ productName: "", productDescription: "", quantity: 1, sellingPrice: 0 }],
};

const OrderDialog = ({ open, onOpenChange, onSuccess }: OrderDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    // Reset form data when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setErrors({});
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const validationResult = orderSchema.safeParse(formData);
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten();
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const createData = {
                discount: Number(formData.discount) || 0,
                feeAmount: Number(formData.feeAmount) || 0,
                feeDescription: formData.feeDescription || undefined,
                orderType: formData.orderType,
                paymentGateway: formData.paymentGateway,
                sessionId: formData.sessionId,
                callbackUrl: formData.callbackUrl || undefined,
                orderDetails: formData.orderDetails.map((detail) => ({
                    ...detail,
                    totalAmount: 0,
                })),
            };
            await createOrder(createData);
            toast({
                title: "Thành công",
                description: "Đơn hàng mới đã được tạo.",
            });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tạo đơn hàng.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.stopPropagation();
        }
    };

    const addOrderDetail = () => {
        setFormData({
            ...formData,
            orderDetails: [...formData.orderDetails, { productName: "", productDescription: "", quantity: 1, sellingPrice: 0 }],
        });
    };

    const updateOrderDetail = (index: number, field: keyof typeof initialFormData.orderDetails[0], value: string | number) => {
        const newDetails = [...formData.orderDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setFormData({ ...formData, orderDetails: newDetails });
    };

    const removeOrderDetail = (index: number) => {
        setFormData({
            ...formData,
            orderDetails: formData.orderDetails.filter((_, i) => i !== index),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Thêm đơn hàng mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="discount">Giảm giá (VNĐ)</Label>
                            <Input
                                id="discount"
                                type="number"
                                min="0"
                                value={formData.discount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)) {
                                        setFormData({ ...formData, discount: value });
                                    }
                                }}
                                placeholder="Nhập số tiền giảm giá"
                                disabled={loading}
                            />
                            {errors.discount && <p className="text-red-500 text-sm">{errors.discount}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="feeAmount">Phí (VNĐ)</Label>
                            <Input
                                id="feeAmount"
                                type="number"
                                min="0"
                                value={formData.feeAmount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)) {
                                        setFormData({ ...formData, feeAmount: value });
                                    }
                                }}
                                placeholder="Nhập số tiền phí"
                                disabled={loading}
                            />
                            {errors.feeAmount && <p className="text-red-500 text-sm">{errors.feeAmount}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="orderType">Loại đơn hàng</Label>
                            <Select
                                value={formData.orderType}
                                onValueChange={(value) => setFormData({ ...formData, orderType: value as EOrderType })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại đơn hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EOrderType.Immediate}>Giao ngay</SelectItem>
                                    <SelectItem value={EOrderType.PreOrder}>Đặt trước</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.orderType && <p className="text-red-500 text-sm">{errors.orderType}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="paymentGateway">Phương thức thanh toán</Label>
                            <Select
                                value={formData.paymentGateway}
                                onValueChange={(value) => setFormData({ ...formData, paymentGateway: value as EPaymentGateway })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn phương thức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EPaymentGateway.MoMo}>MoMo</SelectItem>
                                    <SelectItem value={EPaymentGateway.VNPay}>VNPay</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.paymentGateway && <p className="text-red-500 text-sm">{errors.paymentGateway}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="sessionId">Session ID</Label>
                            <Input
                                id="sessionId"
                                value={formData.sessionId}
                                onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                                placeholder="Nhập session ID"
                                disabled={loading}
                            />
                            {errors.sessionId && <p className="text-red-500 text-sm">{errors.sessionId}</p>}
                        </div>
                        <div className="grid gap-2 min-h-[4.5rem]">
                            <Label htmlFor="callbackUrl">Callback URL</Label>
                            <Input
                                id="callbackUrl"
                                value={formData.callbackUrl}
                                onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                                placeholder="Nhập callback URL (tùy chọn)"
                                disabled={loading}
                            />
                            {errors.callbackUrl && <p className="text-red-500 text-sm">{errors.callbackUrl}</p>}
                        </div>
                        <div className="grid gap-2 col-span-1 sm:col-span-2">
                            <Label htmlFor="feeDescription">Mô tả phí</Label>
                            <Textarea
                                id="feeDescription"
                                value={formData.feeDescription}
                                onChange={(e) => setFormData({ ...formData, feeDescription: e.target.value })}
                                placeholder="Nhập mô tả phí (tùy chọn)"
                                disabled={loading}
                            />
                            {errors.feeDescription && <p className="text-red-500 text-sm">{errors.feeDescription}</p>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Chi tiết đơn hàng</Label>
                        {formData.orderDetails.map((detail, index) => (
                            <div key={index} className="flex flex-col gap-4 border p-4 rounded-md">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor={`productName-${index}`}>Tên sản phẩm</Label>
                                        <Input
                                            id={`productName-${index}`}
                                            placeholder="Nhập tên sản phẩm"
                                            value={detail.productName}
                                            onChange={(e) => updateOrderDetail(index, "productName", e.target.value)}
                                            disabled={loading}
                                        />
                                        {errors.orderDetails?.[index]?.productName && (
                                            <p className="text-red-500 text-sm">{errors.orderDetails[index].productName}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`quantity-${index}`}>Số lượng</Label>
                                        <Input
                                            id={`quantity-${index}`}
                                            type="number"
                                            placeholder="Nhập số lượng"
                                            value={detail.quantity}
                                            onChange={(e) => updateOrderDetail(index, "quantity", Number(e.target.value))}
                                            min="1"
                                            disabled={loading}
                                        />
                                        {errors.orderDetails?.[index]?.quantity && (
                                            <p className="text-red-500 text-sm">{errors.orderDetails[index].quantity}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`sellingPrice-${index}`}>Giá bán (VNĐ)</Label>
                                        <Input
                                            id={`sellingPrice-${index}`}
                                            type="number"
                                            placeholder="Nhập giá bán"
                                            value={detail.sellingPrice !== undefined ? detail.sellingPrice : ""}
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                updateOrderDetail(
                                                    index,
                                                    "sellingPrice",
                                                    inputValue ? Number(inputValue) : ""
                                                );
                                            }}
                                            min="0"
                                            disabled={loading}
                                        />
                                        {errors.orderDetails?.[index]?.sellingPrice && (
                                            <p className="text-red-500 text-sm">{errors.orderDetails[index].sellingPrice}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`productDescription-${index}`}>Mô tả sản phẩm</Label>
                                    <Textarea
                                        id={`productDescription-${index}`}
                                        placeholder="Nhập mô tả sản phẩm (tùy chọn)"
                                        value={detail.productDescription}
                                        onChange={(e) => updateOrderDetail(index, "productDescription", e.target.value)}
                                        disabled={loading}
                                    />
                                    {errors.orderDetails?.[index]?.productDescription && (
                                        <p className="text-red-500 text-sm">{errors.orderDetails[index].productDescription}</p>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeOrderDetail(index)}
                                    disabled={loading || formData.orderDetails.length === 1}
                                >
                                    Xóa sản phẩm
                                </Button>
                            </div>
                        ))}
                        {errors.orderDetails && typeof errors.orderDetails === "string" && (
                            <p className="text-red-500 text-sm">{errors.orderDetails}</p>
                        )}
                        <Button type="button" variant="outline" onClick={addOrderDetail} disabled={loading}>
                            Thêm sản phẩm
                        </Button>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            Thêm
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDialog;