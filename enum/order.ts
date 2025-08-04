export enum EOrderType {
    Immediate = "Immediate",
    PreOrder = "PreOrder",
}

export enum EPaymentGateway {
    VNPay = "VNPay",
    MPOS = "MPOS",
}

export enum EOrderStatus {
    Pending = "Pending",
    Preparing = "Preparing",
    Completed = "Completed",
    Cancelled = "Cancelled",
    Failed = "Failed",
}

export const EOrderStatusViMap: Record<string, string> = {
    [EOrderStatus.Pending]: "Đang chờ",
    [EOrderStatus.Preparing]: "Đang chuẩn bị",
    [EOrderStatus.Completed]: "Hoàn tất",
    [EOrderStatus.Cancelled]: "Đã huỷ",
    [EOrderStatus.Failed]: "Thất bại",
};


export const EOrderTypeViMap: Record<string, string> = {
    [EOrderType.Immediate]: "Giao ngay",
    [EOrderType.PreOrder]: "Đặt trước",
};

export const EPaymentGatewayViMap: Record<string, string> = {
    [EPaymentGateway.VNPay]: "VNPay",
    [EPaymentGateway.MPOS]: "MPOS",
};

