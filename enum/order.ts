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
    Ready = "Ready",
    Completed = "Completed",
    Cancelled = "Cancelled",
    Failed = "Failed",
}

export const EOrderStatusViMap: Record<EOrderStatus, string> = {
    [EOrderStatus.Pending]: "Pending",
    [EOrderStatus.Preparing]: "Preparing",
    [EOrderStatus.Ready]: "Ready",
    [EOrderStatus.Completed]: "Completed",
    [EOrderStatus.Cancelled]: "Cancelled",
    [EOrderStatus.Failed]: "Failed",
};
