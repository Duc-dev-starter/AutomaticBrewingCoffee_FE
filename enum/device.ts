export enum EDeviceStatus {
    Stock = "Stock",
    Working = "Working",
    Maintain = "Maintain"
}

export enum EFunctionParameterType {
    Double = "Double",
    Integer = "Integer",
    Boolean = "Boolean",
    Text = "Text"
}


export const EDeviceStatusViMap: Record<string, string> = {
    [EDeviceStatus.Stock]: "Đang chờ",
    [EDeviceStatus.Working]: "Đang hoạt động",
    [EDeviceStatus.Maintain]: "Bảo trì",
};


