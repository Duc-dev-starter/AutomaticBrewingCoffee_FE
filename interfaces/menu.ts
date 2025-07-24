import { EBaseStatus } from "@/enum/base";
import { Product } from "./product";
import { Organization } from "./organization";

export interface MenuProductMapping {
    menuId: string;
    productId: string;
    displayOrder: number;
    status: EBaseStatus;
    product: Product | null;
    sellingPrice: number;
}

export interface Menu {
    menuId: string;
    name: string;
    description?: string;
    status: EBaseStatus;
    organizationId: string;
    organization: Organization;
    menuProductMappings: MenuProductMapping[];
}