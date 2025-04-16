import { EOrderStatus } from "@/enum/order";

export interface OrderDetail {
    productName: string;
    productDescription: string;
    quantity: number;
    sellingPrice: number;
    totalAmount: number;
}

export interface Order {
    orderId: string;
    discount: number;
    feeAmount: number;
    feeDescription: string;
    finalAmount: number;
    invoiceId: string;
    orderType: string;
    paymentGateway: string;
    sessionId: string;
    status: EOrderStatus;
    totalAmount: number;
    vat: number;
    vatAmount: number;
    orderDetails: OrderDetail[];
    paymentUrl: string;
    paymentQr: string;
}
