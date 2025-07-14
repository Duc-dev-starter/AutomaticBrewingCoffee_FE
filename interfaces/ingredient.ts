import { EBaseStatus } from "@/enum/base";

export interface IngredientType {
    ingredientTypeId: string;
    ingredientType: string;
    name: string;
    description: string;
    status: EBaseStatus;
}