import { Device } from "./device"

// Định nghĩa interface Kiosk
export interface Kiosk {
    kioskId: string
    franchiseId: string
    devices: Device[]
    location: string
    status: string
    installedDate: string
    createdDate: string
    updatedDate: string | null
}