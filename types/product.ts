import { EProductSize, EProductStatus, EProductType } from "@/enum/product";

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
    status: EProductStatus
    createdDate: string;
    updatedDate: string;
}
