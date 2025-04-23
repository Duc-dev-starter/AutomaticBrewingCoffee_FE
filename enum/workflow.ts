export enum EWorkflowType {
    Activity = 'Activity',
    Callback = 'Callback'
}


export const EWorkflowTypeViMap: Record<string, string> = {
    [EWorkflowType.Activity]: "Hoạt động",
    [EWorkflowType.Callback]: "Gọi lại",
};

export enum EWorkflowStepType {
    MoveArmCommand = "MoveArmCommand",
    CloseGripperCommand = "CloseGripperCommand",
    DiscardCupCommand = "DiscardCupCommand",
    ResetArmCommand = "ResetArmCommand",
    MoveFailCommand = "MoveFailCommand",
    OpenFailCommand = "OpenFailCommand",
    CloseFailCommand = "CloseFailCommand",
    OpenGripperCommand = "OpenGripperCommand",
    MakeDrinkCommand = "MakeDrinkCommand",
    MakeFailCommand = "MakeFailCommand",
    DropCupCommand = "DropCupCommand",
    DropFailCommand = "DropFailCommand",
    TakeIceCommand = "TakeIceCommand",
    TakeFailCommand = "TakeFailCommand",
    AlertCancellationCommand = "AlertCancellationCommand",
    CancelOrderCommand = "CancelOrderCommand",
    CompleteOrderCommand = "CompleteOrderCommand",
    CreateOrderCommand = "CreateOrderCommand",
    CancelPaymentCommand = "CancelPaymentCommand",
    RefundCommand = "RefundCommand",
    ValidatePaymentCommand = "ValidatePaymentCommand",
}

export const EWorkflowStepTypeViMap: Record<EWorkflowStepType, string> = {
    [EWorkflowStepType.MoveArmCommand]: "Di chuyển cánh tay",
    [EWorkflowStepType.CloseGripperCommand]: "Đóng kẹp",
    [EWorkflowStepType.DiscardCupCommand]: "Loại bỏ cốc",
    [EWorkflowStepType.ResetArmCommand]: "Reset cánh tay",
    [EWorkflowStepType.MoveFailCommand]: "Lỗi di chuyển",
    [EWorkflowStepType.OpenFailCommand]: "Lỗi mở",
    [EWorkflowStepType.CloseFailCommand]: "Lỗi đóng",
    [EWorkflowStepType.OpenGripperCommand]: "Mở kẹp",
    [EWorkflowStepType.MakeDrinkCommand]: "Pha đồ uống",
    [EWorkflowStepType.MakeFailCommand]: "Lỗi pha đồ uống",
    [EWorkflowStepType.DropCupCommand]: "Thả cốc",
    [EWorkflowStepType.DropFailCommand]: "Lỗi thả cốc",
    [EWorkflowStepType.TakeIceCommand]: "Lấy đá",
    [EWorkflowStepType.TakeFailCommand]: "Lỗi lấy đá",
    [EWorkflowStepType.AlertCancellationCommand]: "Thông báo huỷ đơn",
    [EWorkflowStepType.CancelOrderCommand]: "Huỷ đơn hàng",
    [EWorkflowStepType.CompleteOrderCommand]: "Hoàn tất đơn hàng",
    [EWorkflowStepType.CreateOrderCommand]: "Tạo đơn hàng",
    [EWorkflowStepType.CancelPaymentCommand]: "Huỷ thanh toán",
    [EWorkflowStepType.RefundCommand]: "Hoàn tiền",
    [EWorkflowStepType.ValidatePaymentCommand]: "Xác nhận thanh toán",
};
