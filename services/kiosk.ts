import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Kiosk } from "@/types/kiosk";
import { Api } from "@/constants/api";

export const getKiosks = async (params: PagingParams = {}): Promise<PagingResponse<Kiosk>> => {
    return BaseService.getPaging<Kiosk>({
        url: Api.KIOSKS,
        payload: params,
    });
};

export const getKiosk = async (id: string) => {
    const response = await BaseService.getById({ url: Api.KIOSKS, id });
    return response;
}

export const createKiosk = async (payload: Partial<Kiosk>) => {
    const response = await BaseService.post({ url: Api.KIOSKS, payload });
    return response;
}

export const updateKiosk = async (id: string, payload: Partial<Kiosk>) => {
    const response = await BaseService.put({ url: `${Api.KIOSKS}/${id}`, payload });
    return response;
}

export const deleteKiosk = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.KIOSKS}/${id}` })
    return response;
}
