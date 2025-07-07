export enum EWorkflowType {
    Activity = 'Activity',
    Callback = 'Callback'
}


export const EWorkflowTypeViMap: Record<string, string> = {
    [EWorkflowType.Activity]: "Hoạt động",
    [EWorkflowType.Callback]: "Gọi lại",
};

export enum EConditionName {
    Side = 'Side',
}

export const EConditionNameViMap: Record<string, string> = {
    [EConditionName.Side]: "Hướng đặt",
};

export enum EOperation {
    Equal = "Equal",
    NotEqual = "NotEqual",
    GreaterThan = "GreaterThan",
    GreaterThanOrEqual = "GreaterThanOrEqual",
    LessThan = "LessThan",
    LessThanOrEqual = "LessThanOrEqual",
}


export const EOperationViMap: Record<EOperation, string> = {
    [EOperation.Equal]: "Bằng",
    [EOperation.NotEqual]: "Không bằng",
    [EOperation.GreaterThan]: "Lớn hơn",
    [EOperation.GreaterThanOrEqual]: "Lớn hơn hoặc bằng",
    [EOperation.LessThan]: "Nhỏ hơn",
    [EOperation.LessThanOrEqual]: "Nhỏ hơn hoặc bằng",
};

export enum EExpressionType {
    Literal = "Literal",
    Variable = "Variable",
}

export const EExpressionTypeViMap: Record<EExpressionType, string> = {
    [EExpressionType.Literal]: "Giá trị cố định",
    [EExpressionType.Variable]: "Biến",
};