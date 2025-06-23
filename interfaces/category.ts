import { EBaseStatus } from "@/enum/base";

export interface Category {
    productCategoryId: string;
    name: string;
    description: string;
    imageUrl: string;
    status: EBaseStatus;
    displayOrder: number;
}