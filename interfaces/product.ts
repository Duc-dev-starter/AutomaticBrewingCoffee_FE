import { EProductSize, EProductStatus, EProductType } from "@/enum/product";
import { MenuProductMapping } from "./menu";
import { Category } from "./category";

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
    productCategoryId: string;
    productCategory: Category;
    isHasWorkflow: boolean;
    status: EProductStatus
    createdDate: string;
    updatedDate: string;
}

export interface ProductInMenu extends Product {
    menuProductMappings: MenuProductMapping[];
}


export interface SupportProduct {
    kioskVersionId: string
    productId: string
    product: Product
}
