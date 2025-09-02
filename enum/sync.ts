export enum ESyncEventType {
    Create = "Create",
    Update = "Update",
    Delete = "Delete"
}


export enum EEntityType {
    Device = "Device",
    Workflow = "Workflow",
    Step = "Step",
    KioskDeviceMapping = "KioskDeviceMapping",
}

export const ESyncEventTypeViMap: Record<ESyncEventType, string> = {
    [ESyncEventType.Create]: "Tạo mới",
    [ESyncEventType.Update]: "Cập nhật",
    [ESyncEventType.Delete]: "Xoá",
};

export const EEntityTypeViMap: Record<EEntityType, string> = {
    [EEntityType.Workflow]: "Quy trình",
    [EEntityType.Step]: "Bước",
    [EEntityType.Device]: "Thiết bị",
    [EEntityType.KioskDeviceMapping]: "Thiết bị trong kiosk",
};
