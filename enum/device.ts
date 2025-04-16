export enum EDeviceStatus {
    Idle = "Idle",
    Working = "Working",
    Maintenance = "Maintenance",
    Decommissioned = "Decommissioned"
}


export const EDeviceStatusViMap: Record<string, string> = {
    [EDeviceStatus.Idle]: "Đang chờ",
    [EDeviceStatus.Working]: "Đang hoạt động",
    [EDeviceStatus.Maintenance]: "Bảo trì",
    [EDeviceStatus.Decommissioned]: "Ngừng hoạt động",
};

export const EDeviceStatusStringToEnum: Record<string, EDeviceStatus> = {
    Idle: EDeviceStatus.Idle,
    Working: EDeviceStatus.Working,
    Maintenance: EDeviceStatus.Maintenance,
    Decommissioned: EDeviceStatus.Decommissioned,
};


