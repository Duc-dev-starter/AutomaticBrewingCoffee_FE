export enum EDeviceStatus {
    Stock = "Stock",
    Working = "Working",
    Maintain = "Maintain"
}


export const EDeviceStatusViMap: Record<string, string> = {
    [EDeviceStatus.Stock]: "Đang chờ",
    [EDeviceStatus.Working]: "Đang hoạt động",
    [EDeviceStatus.Maintain]: "Bảo trì",
};