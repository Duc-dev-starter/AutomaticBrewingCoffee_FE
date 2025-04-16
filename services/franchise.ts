import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Franchise } from "@/types/franchise";
import { Api } from "@/constants/api";

export const getFranchises = async (params: PagingParams = {}): Promise<PagingResponse<Franchise>> => {
    return BaseService.getPaging<Franchise>({
        url: Api.FRANCHISES,
        payload: params,
    });
};

export const getFranchise = async (id: string) => {
    const response = await BaseService.getById({ url: Api.FRANCHISES, id });
    return response;
}

export const createFranchise = async (payload: Partial<Franchise>) => {
    const response = await BaseService.post({ url: Api.FRANCHISES, payload });
    return response;
}

export const updateFranchise = async (id: string, payload: Partial<Franchise>) => {
    const response = await BaseService.put({ url: `${Api.FRANCHISES}/${id}`, payload });
    return response;
}

export const deleteFranchise = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.FRANCHISES}/${id}` })
    return response;
}
