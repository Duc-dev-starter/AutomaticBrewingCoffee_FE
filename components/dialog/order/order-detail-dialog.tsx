"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    Info,
    ShoppingCart,
    CreditCard,
    Percent,
    Tag,
    Calendar,
    MapPin,
    Building,
    Phone,
    Mail,
    History, // Icon mới cho lịch sử thanh toán
    AlertCircle,
    CheckCircle2,
    Clock,
} from "lucide-react"
import { formatCurrency } from "@/utils"
import { formatDate } from "@/utils/date"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { OrderDialogProps } from "@/types/dialog"
import { EOrderStatusViMap, EOrderTypeViMap, EPaymentGateway, EPaymentStatus, EPaymentStatusViMap } from "@/enum/order"
import { images } from "@/public/assets"
import clsx from "clsx"
import { getOrderStatusColor } from "@/utils/color"
import { InfoField } from "@/components/common"
import { Payment } from "@/interfaces/order"

// Helper function to get payment status color
const getPaymentStatusColor = (status: EPaymentStatus) => {
    switch (status) {
        case EPaymentStatus.Success:
            return "text-green-600";
        case EPaymentStatus.Pending:
            return "text-yellow-600";
        default:
            return "text-red-600";
    }
}

const OrderDetailDialog = ({ order, open, onOpenChange }: OrderDialogProps) => {
    if (!order) return null

    const paymentLogoMap: Record<EPaymentGateway, string> = {
        [EPaymentGateway.MPOS]: images.mpos,
        [EPaymentGateway.VNPay]: images.vnpay,
    }

    const renderPaymentStatusIcon = (status: EPaymentStatus) => {
        switch (status) {
            case EPaymentStatus.Success:
                return <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            case EPaymentStatus.Pending:
                return <Clock className="w-4 h-4 mr-2 text-yellow-500" />
            default:
                return <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
        }
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
                        <Badge className={clsx("text-white px-3 py-1", getOrderStatusColor(order.status))}>
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
                                    {/* ... Các InfoField khác giữ nguyên ... */}
                                    <InfoField
                                        label="Loại đơn hàng"
                                        value={EOrderTypeViMap[order.orderType]}
                                        icon={<Tag className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày tạo"
                                        value={formatDate(order.createdDate) || "Chưa có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày cập nhật"
                                        value={formatDate(order.updatedDate) || "Chưa cập nhật"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày chờ"
                                        value={formatDate(order.pendingDate || "") || "Chưa có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày hoàn thành"
                                        value={formatDate(order.completedDate || "") || "Chưa có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày hủy"
                                        value={formatDate(order.cancelledDate || "") || "Chưa có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày thất bại"
                                        value={formatDate(order.failedDate || "") || "Chưa có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày chuẩn bị"
                                        value={formatDate(order.preparingDate || "") || "Chưa có"}
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
                                        label="Cổng thanh toán"
                                        value={
                                            <img
                                                src={paymentLogoMap[order.paymentGateway] || "/placeholder.svg"}
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

                        {/* Lịch sử thanh toán - Đã thêm mới */}
                        {order.payments && order.payments.length > 0 && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <History className="w-5 h-5 mr-2 text-primary-500" />
                                        Lịch sử thanh toán ({order.payments.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {order.payments.map((payment: Payment) => (
                                            <div key={payment.paymentId} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center font-semibold">
                                                        {renderPaymentStatusIcon(payment.paymentStatus)}
                                                        <span className={clsx("font-semibold", getPaymentStatusColor(payment.paymentStatus))}>
                                                            {EPaymentStatusViMap[payment.paymentStatus]}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-800">
                                                        {formatCurrency(payment.paidAmount)} / {formatCurrency(payment.requiredAmount)}
                                                    </div>
                                                </div>
                                                <div className="border-t border-dashed pt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                                    <div><InfoField label="Ngày tạo" value={formatDate(payment.createdDate)} icon={undefined} /></div>
                                                    <div><InfoField label="Ngày thực hiện" value={formatDate(payment.paymentDate)} icon={undefined} /></div>
                                                    <div><InfoField label="Ngày hết hạn" value={formatDate(payment.expiredDate)} icon={undefined} /></div>
                                                    <div><InfoField label="ID Giao dịch" value={<span className="font-mono text-xs">{payment.paymentId}</span>} icon={undefined} /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}


                        {/* Chi tiết sản phẩm */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <ShoppingCart className="w-5 h-5 mr-2 text-primary-500" />
                                    Chi tiết đơn hàng ({order.orderDetails.length})
                                </h3>
                                <div className="space-y-4">
                                    {order.orderDetails.map((detail, index) => (
                                        <div key={index} className="border rounded-md p-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{detail.productName}</h4>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {detail.productDescription || "Chưa có"}
                                                    </p>
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

                        {/* Thông tin kiosk */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                {/* Thông tin Kiosk và Cửa hàng - Đã cập nhật */}
                                {order.kiosk && (
                                    <div className="rounded-lg p-4 border border-green-100">
                                        <h4 className="text-md font-semibold mb-3 flex items-center">
                                            <Building className="w-4 h-4 mr-2" />
                                            Cửa hàng: {order.kiosk.store?.name || "Không có thông tin"}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoField
                                                label="Vị trí Kiosk"
                                                value={order.kiosk.position || "Chưa có"}
                                                icon={<MapPin className="w-4 h-4 text-primary-500" />}
                                            />
                                            <InfoField
                                                label="Địa chỉ cửa hàng"
                                                value={order.kiosk.store?.locationAddress || "Chưa có"}
                                                icon={<MapPin className="w-4 h-4 text-primary-500" />}
                                            />
                                            <InfoField
                                                label="Số điện thoại"
                                                value={order.kiosk.store?.contactPhone || "Chưa có"}
                                                icon={<Phone className="w-4 h-4 text-primary-500" />}
                                            />

                                        </div>
                                    </div>
                                )}


                                {/* Thông tin tổ chức */}
                                {order.kiosk?.store?.organization && (
                                    <div className="rounded-lg p-4 border border-purple-100">
                                        <h4 className="text-md font-semibold mb-3 flex items-center">
                                            <Building className="w-4 h-4 mr-2" />
                                            Tổ chức: {order.kiosk.store.organization.name}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    {order.kiosk.store.organization.logoUrl ? (
                                                        <img
                                                            src={order.kiosk.store.organization.logoUrl || "/placeholder.svg"}
                                                            alt={order.kiosk.store.organization.name}
                                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <Building className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-primary-500">{order.kiosk.store.organization.name}</p>
                                                    <p className="text-sm text-primary-500">{order.kiosk.store.organization.organizationCode}</p>
                                                    <p className="text-sm text-primary-500 mt-1">{order.kiosk.store.organization.description}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <InfoField
                                                    label="Số điện thoại"
                                                    value={order.kiosk.store.organization.contactPhone || "Chưa có"}
                                                    icon={<Phone className="w-4 h-4 text-primary-500" />}
                                                />
                                                <InfoField
                                                    label="Email liên hệ"
                                                    value={order.kiosk.store.organization.contactEmail || "Chưa có"}
                                                    icon={<Mail className="w-4 h-4 text-primary-500" />}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default OrderDetailDialog