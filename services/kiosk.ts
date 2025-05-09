import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";
import { Kiosk, KioskType, KioskVersion } from "@/interfaces/kiosk";

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

export const getKioskTypes = async (params: PagingParams = {}): Promise<PagingResponse<KioskType>> => {
    return BaseService.getPaging<KioskType>({
        url: Api.KIOSKS_TYPES,
        payload: params,
    });
};

export const getKioskType = async (id: string) => {
    const response = await BaseService.getById({ url: Api.KIOSKS_TYPES, id });
    return response;
}

export const createKioskType = async (payload: Partial<KioskType>) => {
    const response = await BaseService.post({ url: Api.KIOSKS_TYPES, payload });
    return response;
}

export const updateKioskType = async (id: string, payload: Partial<KioskType>) => {
    const response = await BaseService.put({ url: `${Api.KIOSKS_TYPES}/${id}`, payload });
    return response;
}

export const deleteKioskType = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.KIOSKS_TYPES}/${id}` })
    return response;
}

export const getKioskVersions = async (params: PagingParams = {}): Promise<PagingResponse<KioskVersion>> => {
    return BaseService.getPaging<KioskVersion>({
        url: Api.KIOSKS_VERSIONS,
        payload: params,
    });
};

export const getKioskVersion = async (id: string) => {
    const response = await BaseService.getById({ url: Api.KIOSKS_VERSIONS, id });
    return response;
}

export const createKioskVersion = async (payload: Partial<KioskVersion>) => {
    const response = await BaseService.post({ url: Api.KIOSKS_VERSIONS, payload });
    return response;
}

export const updateKioskVersion = async (id: string, payload: Partial<KioskVersion>) => {
    const response = await BaseService.put({ url: `${Api.KIOSKS_VERSIONS}/${id}`, payload });
    return response;
}

export const deleteKioskVersion = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.KIOSKS_VERSIONS}/${id}` })
    return response;
}

export const createDeviceModelInKioskVersion = async (payload: { kioskVersionId: string, deviceModelId: string, quantity: number }) => {
    const response = await BaseService.post({ url: `${Api.KIOSKS_VERSIONS}/device-models`, payload });
    return response;
}
