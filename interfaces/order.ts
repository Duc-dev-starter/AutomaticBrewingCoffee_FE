import { EOrderStatus, EOrderType, EPaymentGateway, EPaymentStatus } from "@/enum/order";

export interface OrderDetail {
    productName: string;
    productDescription: string;
    quantity: number;
    sellingPrice: number;
    totalAmount: number;
}

export interface ProductStatus {
    productId: string;
    productName: string;
    sellingPrice: number;
}


export interface Payment {
    paymentId: string;
    orderId: string;
    paidAmount: number;
    requiredAmount: number;
    paymentStatus: EPaymentStatus;
    paymentDate: string;
    createdDate: string;
    updatedDate: string;
    expiredDate: string;
}



export interface Order {
    orderId: string;
    clientId: string;
    kioskId: string;
    storeId: string;
    organizationId: string;

    discount: number;
    discountCode: string;
    finalAmount: number;
    totalAmount: number;

    status: EOrderStatus;
    orderType: EOrderType;
    paymentGateway: EPaymentGateway;

    orderDetails: OrderDetail[];
    payments: Payment[];

    completedProducts: ProductStatus[];
    failedProducts: ProductStatus[];
    preparingProducts: ProductStatus[];

    createdDate: string;
    updatedDate: string;

    pendingDate: string | null;
    preparingDate: string | null;
    completedDate: string | null;
    cancelledDate: string | null;
    failedDate: string | null;

}
