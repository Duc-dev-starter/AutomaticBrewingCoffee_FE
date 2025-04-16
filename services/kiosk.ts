import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Franchise } from "@/types/franchise";
import { Kiosk } from "@/types/kiosk";

export const getKiosks = async (params: PagingParams = {}): Promise<PagingResponse<Kiosk>> => {
    return BaseService.getPaging<Kiosk>({
        url: `/franchises`,
        payload: params,
    });
};

export const getKiosk = async (id: string) => {
    const response = await BaseService.getById({ url: '/kiosks', id });
    return response;
}

export const createKiosk = async (payload: Partial<Kiosk>) => {
    const response = await BaseService.post({ url: '/kiosks', payload });
    return response;
}

export const updateKiosk = async (id: string, payload: Partial<Kiosk>) => {
    const response = await BaseService.put({ url: `/kiosks/${id}`, payload });
    return response;
}

export const deleteKiosk = async (id: string) => {
    const response = await BaseService.delete({ url: '/kiosks' })
    return response;
}
