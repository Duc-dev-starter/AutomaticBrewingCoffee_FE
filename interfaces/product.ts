import { EProductSize, EProductStatus, EProductType } from "@/enum/product";
import { MenuProductMapping } from "./menu";

export interface Product {
    productId: string;
    parentId: string;
    name: string;
    description: string;
    isActive: boolean;
    size: EProductSize;
    type: EProductType;
    price: number;
    imageUrl: string;
    productParentName: string;
    status: EProductStatus
    createdDate: string;
    updatedDate: string;
}

export interface ProductInMenu extends Product {
    menuProductMappings: MenuProductMapping[];
}
