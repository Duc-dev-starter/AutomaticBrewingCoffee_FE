import { BaseService } from "./base.service"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";
import { Store } from "@/interfaces/store";

export const getStores = async (params: PagingParams = {}): Promise<PagingResponse<Store>> => {
    return BaseService.getPaging<Store>({
        url: Api.STORES,
        payload: params,
    });
};

export const getStore = async (id: string) => {
    const response = await BaseService.getById({ url: Api.STORES, id });
    return response;
}

export const createStore = async (payload: Partial<Store>) => {
    const response = await BaseService.post({ url: Api.STORES, payload });
    return response;
}

export const updateStore = async (id: string, payload: Partial<Store>) => {
    const response = await BaseService.put({ url: `${Api.STORES}/${id}`, payload });
    return response;
}

export const deleteStore = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.STORES}/${id}` })
    return response;
}
