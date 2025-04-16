import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Order } from "@/types/order";

const OrderDetailDialog = ({ order }: { order: Order }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Xem chi tiết</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <div>
                        <strong>Mã đơn hàng:</strong> {order.orderId}
                    </div>
                    <div>
                        <strong>Chiết khấu:</strong> {order.discount} VND
                    </div>
                    <div>
                        <strong>Phí:</strong> {order.feeAmount} VND
                    </div>
                    <div>
                        <strong>Miêu tả phí:</strong> {order.feeDescription}
                    </div>
                    <div>
                        <strong>Số tiền cuối:</strong> {order.finalAmount} VND
                    </div>
                    <div>
                        <strong>Mã hóa đơn:</strong> {order.invoiceId}
                    </div>
                    <div>
                        <strong>Loại đơn hàng:</strong> {order.orderType}
                    </div>
                    <div>
                        <strong>Hình thức thanh toán:</strong> {order.paymentGateway}
                    </div>
                    <div>
                        <strong>Trạng thái:</strong> {order.status}
                    </div>
                    <div>
                        <strong>Số tiền đã thanh toán:</strong> {order.totalAmount} VND
                    </div>
                    <div>
                        <strong>VAT:</strong> {order.vat}%
                    </div>
                    <div>
                        <strong>VAT Amount:</strong> {order.vatAmount} VND
                    </div>
                    <div>
                        <strong>Chi tiết sản phẩm:</strong>
                        {order.orderDetails.map((detail, index) => (
                            <div key={index}>
                                <div><strong>Tên sản phẩm:</strong> {detail.productName}</div>
                                <div><strong>Mô tả sản phẩm:</strong> {detail.productDescription}</div>
                                <div><strong>Số lượng:</strong> {detail.quantity}</div>
                                <div><strong>Giá bán:</strong> {detail.sellingPrice} VND</div>
                                <div><strong>Tổng số tiền:</strong> {detail.totalAmount} VND</div>
                            </div>
                        ))}
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};
export default OrderDetailDialog;