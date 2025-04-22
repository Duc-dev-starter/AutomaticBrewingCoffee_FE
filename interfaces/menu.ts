import { EBaseStatus } from "@/enum/base";
import { Product } from "./product";

export interface MenuProductMapping {
    menuId: string;
    productId: string;
    displayOrder: number;
    statusInMenu: EBaseStatus;
    product: Product;
}

export interface Menu {
    menuId: string;
    kioskId: string;
    name: string;
    description?: string;
    status: EBaseStatus;
    menuProductMappings: MenuProductMapping[];
}