import { BaseService } from "./base.service"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";
import { LocationType } from "@/interfaces/location";
import { IngredientType } from "@/interfaces/ingredient";

export const getIngredientTypes = async (params: PagingParams = {}): Promise<PagingResponse<IngredientType>> => {
    return BaseService.getPaging<IngredientType>({
        url: Api.INGREDIENT_TYPES,
        payload: params,
    });
};

export const getIngredientType = async (id: string) => {
    const response = await BaseService.getById({ url: Api.INGREDIENT_TYPES, id });
    return response;
}

export const createIngredientType = async (payload: Partial<IngredientType>) => {
    const response = await BaseService.post({ url: Api.INGREDIENT_TYPES, payload });
    return response;
}

export const updateIngredientType = async (id: string, payload: Partial<IngredientType>) => {
    const response = await BaseService.put({ url: `${Api.INGREDIENT_TYPES}/${id}`, payload });
    return response;
}

export const deleteIngredientType = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.INGREDIENT_TYPES}/${id}` })
    return response;
}
