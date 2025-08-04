"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Info, ShoppingCart, CreditCard, Percent, Tag, Calendar } from "lucide-react"
import { formatCurrency } from "@/utils"
import { formatDate } from "@/utils/date"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { OrderDialogProps } from "@/types/dialog"
import { EOrderStatusViMap, EOrderTypeViMap, EPaymentGateway } from "@/enum/order"
import { images } from "@/public/assets"
import clsx from "clsx"
import { getOrderStatusColor } from "@/utils/color"
import { InfoField } from "@/components/common"

const OrderDetailDialog = ({ order, open, onOpenChange }: OrderDialogProps) => {
    if (!order) return null

    const paymentLogoMap: Record<EPaymentGateway, string> = {
        [EPaymentGateway.MPOS]: images.mpos,
        [EPaymentGateway.VNPay]: images.vnpay,
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                <DialogTitle asChild>
                    <VisuallyHidden>Chi tiết đơn hàng</VisuallyHidden>
                </DialogTitle>
                {/* Header */}
                <div className="bg-primary-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-100">
                                <ShoppingCart className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết đơn hàng</h1>
                                <p className="text-gray-500 text-sm">Thông tin chi tiết đơn hàng</p>
                            </div>
                        </div>
                        <Badge className={clsx("bg-primary-500 text-white px-3 py-1", getOrderStatusColor(order.status))}>
                            <FileText className="mr-1 h-3 w-3" />
                            {EOrderStatusViMap[order.status]}
                        </Badge>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Thông tin đơn hàng */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin đơn hàng
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Loại đơn hàng"
                                        value={EOrderTypeViMap[order.orderType]}
                                        icon={<Tag className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày tạo"
                                        value={formatDate(order.createdDate) || "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày cập nhật"
                                        value={formatDate(order.updatedDate) || "Chưa cập nhật"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày chờ"
                                        value={formatDate(order.pendingDate || '') || "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày hoàn thành"
                                        value={formatDate(order.completedDate || '') || "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày hủy"
                                        value={formatDate(order.cancelledDate || '') || "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày thất bại"
                                        value={formatDate(order.failedDate || '') || "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày chuẩn bị"
                                        value={formatDate(order.preparingDate || '') || "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin thanh toán */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin thanh toán
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Hình thức thanh toán"
                                        value={
                                            <img
                                                src={paymentLogoMap[order.paymentGateway]}
                                                alt={order.paymentGateway}
                                                className="h-6 w-auto object-contain mt-1"
                                            />
                                        }
                                        icon={<CreditCard className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Tổng tiền đơn hàng"
                                        value={formatCurrency(order.totalAmount)}
                                        icon={<Tag className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Chiết khấu"
                                        value={`-${formatCurrency(order.discount)}`}
                                        icon={<Percent className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Thành tiền"
                                        value={formatCurrency(order.finalAmount)}
                                        icon={<Tag className="w-4 h-4 text-primary-500" />}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chi tiết sản phẩm */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <ShoppingCart className="w-5 h-5 mr-2 text-primary-500" />
                                    Chi tiết sản phẩm ({order.orderDetails.length})
                                </h3>
                                <div className="space-y-4">
                                    {order.orderDetails.map((detail, index) => (
                                        <div key={index} className="border rounded-md p-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{detail.productName}</h4>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{detail.productDescription || "Không có"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-sm">{formatCurrency(detail.sellingPrice)}</div>
                                                    <div className="text-xs text-gray-500">x{detail.quantity}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed">
                                                <div className="flex items-center text-xs">
                                                    <Tag className="h-3 w-3 mr-1 text-gray-500" />
                                                    <span className="text-gray-500">Thành tiền:</span>
                                                </div>
                                                <div className="font-medium text-sm">{formatCurrency(detail.totalAmount)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default OrderDetailDialog