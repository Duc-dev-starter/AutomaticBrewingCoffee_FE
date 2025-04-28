import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Order } from "@/interfaces/order"
import { EOrderStatusViMap, EOrderTypeViMap, EPaymentGateway, EPaymentGatewayViMap } from "@/enum/order"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Receipt, CreditCard, Tag, Percent, FileText, ShoppingCart, Info, Calendar } from "lucide-react"
import { formatCurrency } from "@/utils"
import { ScrollArea } from "../../ui/scroll-area"
import clsx from "clsx"
import { getOrderStatusColor, getPaymentColor } from "@/utils/color"
import { images } from "@/public/assets"
import { OrderDialogProps } from "@/types/dialog"



const OrderDetailDialog = ({ order, open, onOpenChange }: OrderDialogProps) => {
    if (!order) return null

    const paymentLogoMap: Record<EPaymentGateway, string> = {
        [EPaymentGateway.MoMo]: images.momo,
        [EPaymentGateway.VNPay]: images.vnpay,
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Receipt className="mr-2 h-5 w-5" />
                            Chi tiết đơn hàng
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getOrderStatusColor(order.status))}>
                            {EOrderStatusViMap[order.status]}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã đơn: <span className="font-medium ml-1">{order.orderId}</span>
                        </div>
                        {/* {order.createdAt && (
                <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDate(order.createdAt)}
                </div>
                )} */}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto pr-4 hide-scrollbar">
                    <div className="space-y-6 py-2">
                        {/* Thông tin đơn hàng */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin đơn hàng
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Loại đơn hàng</span>
                                        <Badge variant="outline" className="mt-1 w-fit">
                                            {EOrderTypeViMap[order.orderType]}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Mã hóa đơn</span>
                                        <span className="font-medium">{order.invoiceId || "N/A"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin thanh toán */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Thông tin thanh toán
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Hình thức thanh toán</span>
                                        <img
                                            src={paymentLogoMap[order.paymentGateway]}
                                            alt={order.paymentGateway}
                                            className="h-4 w-4 object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tổng tiền đơn hàng</span>
                                        <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Chiết khấu</span>
                                        <div className="flex items-center">
                                            <Percent className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium text-green-600">-{formatCurrency(order.discount)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Phí</span>
                                        <span className="font-medium">{formatCurrency(order.feeAmount)}</span>
                                    </div>
                                    {order.feeDescription && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground text-xs">{order.feeDescription}</span>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-3" />

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">VAT ({order.vat}%)</span>
                                        <span className="font-medium">{formatCurrency(order.vatAmount)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground font-medium">Thành tiền</span>
                                        <span className="font-bold text-lg">{formatCurrency(order.finalAmount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chi tiết sản phẩm */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Chi tiết sản phẩm ({order.orderDetails.length})
                                </h3>

                                <div className="space-y-4">
                                    {order.orderDetails.map((detail, index) => (
                                        <div key={index} className="border rounded-md p-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{detail.productName}</h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{detail.productDescription}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{formatCurrency(detail.sellingPrice)}</div>
                                                    <div className="text-sm text-muted-foreground">x{detail.quantity}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed">
                                                <div className="flex items-center text-sm">
                                                    <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Thành tiền:</span>
                                                </div>
                                                <div className="font-medium">{formatCurrency(detail.totalAmount)}</div>
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
