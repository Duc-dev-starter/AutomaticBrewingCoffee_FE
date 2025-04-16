export enum EOrderStatus {
    Pending = 0,
    Preparing = 1,
    Ready = 2,
    Completed = 3,
    Cancelled = 4,
    Failed = 5,
}

export const EOrderStatusViMap: Record<EOrderStatus, string> = {
    [EOrderStatus.Pending]: "Pending",
    [EOrderStatus.Preparing]: "Preparing",
    [EOrderStatus.Ready]: "Ready",
    [EOrderStatus.Completed]: "Completed",
    [EOrderStatus.Cancelled]: "Cancelled",
    [EOrderStatus.Failed]: "Failed",
};
