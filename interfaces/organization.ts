import { EBaseStatus } from "@/enum/base";

export interface Organization {
    organizationId: string,
    name: string,
    description: string,
    contactPhone: string,
    contactEmail: string,
    logoUrl: string,
    taxId: string,
    status: EBaseStatus
}