"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { refundOrder } from "@/services/order.service"
import { useToast } from "@/hooks/use-toast"
import { OrderDialogProps } from "@/types/dialog"


const OrderRefundDialog = ({ order, open, onOpenChange }: OrderDialogProps) => {
    const { toast } = useToast()
    const [content, setContent] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleRefund = async () => {
        if (!order) return;
        setIsLoading(true)
        try {
            await refundOrder(order.orderId, {
                content,
                refundAmount: order.totalAmount,
            })
            toast({
                title: "Thành công",
                description: "Gửi yêu cầu hoàn tiền thành công",
            })
            setContent("")
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Gửi yêu cầu hoàn tiền thất bại",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }
    if (!order) return null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hoàn tiền đơn hàng #{order.orderId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
                            Tổng số tiền hoàn lại
                        </label>
                        <Input
                            id="totalAmount"
                            value={order.totalAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                            readOnly
                            className="bg-gray-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                            Lý do hoàn tiền
                        </label>
                        <Input
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhập lý do hoàn tiền..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button onClick={handleRefund} disabled={isLoading || !content}>
                        {isLoading ? "Đang xử lý..." : "Xác nhận"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default OrderRefundDialog