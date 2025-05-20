import { EBaseStatus } from "@/enum/base";
import { Device, DeviceModel } from "./device"
import { Store } from "./store";
import { Webhook } from "./webhook";

export interface Kiosk {
    kioskId: string;
    kioskVersionId: string;
    devices: Device[];
    location: string;
    status: EBaseStatus;
    installedDate: string;
    createdDate: string;
    updatedDate: string | null;
    kioskVersion: KioskVersion;
    position: string;
    warrantyTime: string;
    storeId: string;
    store: Store;
    kioskDevices: KioskDevice[];
    apiKey: string;
    webhooks?: Webhook[];
}

export interface KioskDevice {
    device: Device;
    deviceId: string;
    kioskDeviceMappingId: string;
    kioskId: string;
    status: EBaseStatus
}

export interface KioskType {
    name: string;
    description: string;
    status: EBaseStatus;
    kioskTypeId: string;
    createdDate: string;
    updatedDate: string | null;
}

export interface KioskVersion {
    kioskTypeId: string;
    description: string;
    kioskVersionId: string;
    versionTitle: string;
    versionNumber: string;
    status: EBaseStatus;
    kiosks: Kiosk[];
    kioskVersionDeviceModelMappings: KioskVersionDeviceModelMappings[];
    kioskType: KioskType;
    createdDate: string;
    updatedDate: string | null;
}

export interface KioskVersionDeviceModelMappings {
    kioskVersionId: string;
    deviceModelId: string;
    kioskVersion: KioskVersion;
    deviceModel: DeviceModel;
    quantity: number;
}