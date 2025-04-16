import { EDeviceStatus } from "@/enum/device";

export interface Device {
    deviceId: string;
    name: string;
    description: string;
    status: EDeviceStatus;
    createdDate: string;
    updatedDate: string | null;
}
