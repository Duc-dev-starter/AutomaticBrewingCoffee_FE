export enum ESeverity {
    Critical = "Critical",
    Info = "Info",
    Warning = "Warning",
}

export enum ENotificationType {
    KioskNotWorking = "KioskNotWorking",
    KioskBusy = "KioskBusy",
    KioskNotEnoughIngredient = "KioskNotEnoughIngredient",
    OrderCreateFailed = "OrderCreateFailed",
    OrderExecuteFailed = "OrderExecuteFailed",
}

export enum EReferenceType {
    Kiosk = "Kiosk",
    Order = "Order",
}


export const ENotificationTypeViMap: Record<string, string> = {
    [ENotificationType.KioskBusy]: "Kiosk bận",
    [ENotificationType.KioskNotWorking]: "Kiosk không hoạt động",
    [ENotificationType.KioskNotEnoughIngredient]: "Kiosk không đủ nguyên liệu",
    [ENotificationType.OrderCreateFailed]: "Đặt hàng không thành công",
    [ENotificationType.OrderExecuteFailed]: "Thực hiện đơn hàng không thành công",
};

export const EReferenceTypeViMap: Record<string, string> = {
    [EReferenceType.Kiosk]: "Kiosk",
    [EReferenceType.Order]: "Đơn hàng",
};

export const ESeverityViMap: Record<string, string> = {
    [ESeverity.Critical]: "Nghiêm trọng",
    [ESeverity.Info]: "Thông tin",
    [ESeverity.Warning]: "Cảnh báo",
}