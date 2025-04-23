import { EBaseStatus } from "@/enum/base";
import { Product } from "./product";
import { Kiosk } from "./kiosk";

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
    kiosk: Kiosk;
    name: string;
    description?: string;
    status: EBaseStatus;
    menuProductMappings: MenuProductMapping[];
}