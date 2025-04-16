import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Franchise } from "@/types/franchise";

export const getFranchises = async (params: PagingParams = {}): Promise<PagingResponse<Franchise>> => {
    return BaseService.getPaging<Franchise>({
        url: `/franchises`,
        payload: params,
    });
};

export const getFranchise = async (id: string) => {
    const response = await BaseService.getById({ url: '/franchises', id });
    return response;
}

export const createFranchise = async (payload: Partial<Franchise>) => {
    const response = await BaseService.post({ url: '/franchises', payload });
    return response;
}

export const updateFranchise = async (id: string, payload: Partial<Franchise>) => {
    const response = await BaseService.put({ url: `/franchises/${id}`, payload });
    return response;
}

export const deleteFranchise = async (id: string) => {
    const response = await BaseService.delete({ url: '/franchises' })
    return response;
}
