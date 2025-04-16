export enum EDeviceStatus {
    Idle = "Idle",
    Working = "Working",
    Repair = "Repair",
    Broken = "Broken"
}


export const EDeviceStatusViMap: Record<string, string> = {
    [EDeviceStatus.Idle]: "Đang chờ",
    [EDeviceStatus.Working]: "Đang hoạt động",
    [EDeviceStatus.Repair]: "Bảo trì",
    [EDeviceStatus.Broken]: "Ngừng hoạt động",
};

export const EDeviceStatusStringToEnum: Record<string, EDeviceStatus> = {
    Idle: EDeviceStatus.Idle,
    Working: EDeviceStatus.Working,
    Repair: EDeviceStatus.Repair,
    Broken: EDeviceStatus.Broken,
};


