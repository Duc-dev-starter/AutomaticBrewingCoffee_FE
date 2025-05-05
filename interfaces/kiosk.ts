import { EBaseStatus } from "@/enum/base";
import { Device } from "../interfaces/device"

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

}

export interface KioskType {
    name: string;
    description: string;
    status: string;
    kioskTypeId: string;
}

export interface KioskVersion {
    kioskTypeId: string;
    description: string;
    kioskVersionId: string;
    versionTitle: string;
    versionNumber: string;
    status: EBaseStatus;
    kiosks: Kiosk[];
    kioskType: KioskType
}