import { EDeviceStatus } from "@/enum/device";

export interface Device {
    deviceId: string;
    name: string;
    description: string;
    status: EDeviceStatus;
    createdDate: string;
    updatedDate: string | null;
    deviceModel: DeviceModel;
    serialNumber: string;
}


export interface DeviceType {
    name: string;
    description: string;
    deviceTypeId: string;
}

export interface DeviceModel {
    modelName: string;
    manufacturer: string;
    deviceModelId: string;
    deviceTypeId: string;
    deviceType: DeviceType;
}