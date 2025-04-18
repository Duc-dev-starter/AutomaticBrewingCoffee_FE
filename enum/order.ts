export enum EOrderType {
    Immediate = "Immediate",
    PreOrder = "Pre-Order",
}

export enum EPaymentGateway {
    VNPay = "VNPay",
    MoMo = "MoMo"
}

export enum EOrderStatus {
    Pending = "Pending",
    Preparing = "Preparing",
    Completed = "Completed",
    Cancelled = "Cancelled",
    Failed = "Failed",
}

export const EOrderStatusViMap: Record<EOrderStatus, string> = {
    [EOrderStatus.Pending]: "Đang chờ",
    [EOrderStatus.Preparing]: "Đang chuẩn bị",
    [EOrderStatus.Completed]: "Hoàn tất",
    [EOrderStatus.Cancelled]: "Đã huỷ",
    [EOrderStatus.Failed]: "Thất bại",
};


export const EOrderTypeViMap: Record<EOrderType, string> = {
    [EOrderType.Immediate]: "Giao ngay",
    [EOrderType.PreOrder]: "Đặt trước",
};

export const EPaymentGatewayViMap: Record<EPaymentGateway, string> = {
    [EPaymentGateway.VNPay]: "VNPay",
    [EPaymentGateway.MoMo]: "MoMo",
};

