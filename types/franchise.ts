import { EBaseStatus } from "@/enum/base";

export interface Franchise {
    franchiseId: string;
    name?: string | null;
    description?: string | null;
    contactEmail?: string | null;
    address?: string | null;
    taxId?: string | null;
    status: EBaseStatus;
    createdDate: string;
    updatedDate?: string | null;
}
