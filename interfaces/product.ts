import { EAttributteOption, EBaseUnit, EIngredientType, EProductSize, EProductStatus, EProductType } from "@/enum/product";
import { MenuProductMapping } from "./menu";
import { Category } from "./category";

export interface Product {
    productId: string;
    parentId: string;
    name: string;
    description: string;
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
    tagName: string;
    productAttributes: ProductAttribute[];
}

export interface ProductInMenu extends Product {
    menuProductMappings: MenuProductMapping[];
}


export interface SupportProduct {
    kioskVersionId: string
    productId: string
    product: Product
}


export interface ProductAttributeOption {
    name: string;
    value: number;
    unit: EAttributteOption;
    displayOrder: number;
    description: string;
    isDefault: boolean;
}

export interface ProductAttribute {
    label: string;
    ingredientType: string;
    description: string;
    displayOrder: number;
    defaultAmount: number;
    unit: EBaseUnit;
    attributeOptions: ProductAttributeOption[];
}
