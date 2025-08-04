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

export enum EPaymentStatus {
    Pending = "Pending",       // Đang chờ thanh toán
    Success = "Success",       // Thanh toán thành công
    Failed = "Failed",         // Thanh toán thất bại
    Cancelled = "Cancelled",   // Người dùng hủy thanh toán
    Expired = "Expired",       // Hết hạn thanh toán
    Error = "Error",           // Lỗi hệ thống

    Refunding = "Refunding",     // Đang hoàn tiền
    Refunded = "Refunded",       // Hoàn tiền thành công
    RefundFailed = "Refund Failed", // Hoàn tiền thất bại
    Reversed = "Reversed",       // Bị ngân hàng thu hồi giao dịch
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

export const EPaymentStatusViMap: Record<string, string> = {
    [EPaymentStatus.Pending]: "Đang chờ thanh toán",
    [EPaymentStatus.Success]: "Thanh toán thành công",
    [EPaymentStatus.Failed]: "Thanh toán thất bại",
    [EPaymentStatus.Cancelled]: "Người dùng hủy thanh toán",
    [EPaymentStatus.Expired]: "Hết hạn thanh toán",
    [EPaymentStatus.Error]: "Lỗi hệ thống",

    [EPaymentStatus.Refunding]: "Đang hoàn tiền",
    [EPaymentStatus.Refunded]: "Hoàn tiền thành công",
    [EPaymentStatus.RefundFailed]: "Hoàn tiền thất bại",
    [EPaymentStatus.Reversed]: "Bị ngân hàng thu hồi giao dịch",
}