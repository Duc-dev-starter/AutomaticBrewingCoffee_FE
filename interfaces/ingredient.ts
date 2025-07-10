import { EBaseStatus } from "@/enum/base";

export interface IngredientType {
    ingredientTypeId: string;
    name: string;
    description: string;
    status: EBaseStatus;
}