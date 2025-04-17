import { EBaseStatus } from "@/enum/base";
import { Device } from "../interfaces/device"
import { Franchise } from "../interfaces/franchise";

export interface Kiosk {
    kioskId: string;
    franchiseId: string;
    franchise: Franchise;
    devices: Device[];
    location: string;
    status: EBaseStatus;
    installedDate: string;
    createdDate: string;
    updatedDate: string | null;
}