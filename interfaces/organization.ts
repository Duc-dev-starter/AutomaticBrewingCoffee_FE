import { EBaseStatus } from "@/enum/base";

export interface Organization {
    organizationId: string;
    organizationCode?: string;
    name: string;
    description: string;
    contactPhone: string;
    contactEmail: string;
    logoUrl: string;
    taxId: string;
    status: EBaseStatus;
    createdDate: string;
    updatedDate: string | null;
    deletedDate?: string | null;
    isDeleted?: boolean;
}
