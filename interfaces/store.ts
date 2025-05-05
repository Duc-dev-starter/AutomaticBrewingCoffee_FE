import { EBaseStatus } from "@/enum/base";
import { Kiosk } from "./kiosk";
import { Organization } from "./organization";
import { LocationType } from "./location";

export interface Store {
    storeId: string;
    contactPhone: string;
    deviceTypeId: string;
    organization: Organization
    name: string;
    description: string,
    locationAddress: string,
    locationTypeId: string,
    kiosk: Kiosk[];
    status: EBaseStatus;
    locationType: LocationType;
}

