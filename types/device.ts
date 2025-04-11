export type DeviceStatus = {

}

export interface Device {
    deviceId: string;
    name: string;
    description: string;
    status: string;
    createdDate: string;
    updatedDate: string | null;
}