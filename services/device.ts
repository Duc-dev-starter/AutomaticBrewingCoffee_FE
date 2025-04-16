import { Device } from "@/types/device";
import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";

export const getDevices = async (params: PagingParams = {}): Promise<PagingResponse<Device>> => {
    return BaseService.getPaging<Device>({
        url: Api.DEVICES,
        payload: params,
    });
};

export const getDevice = async (id: string) => {
    const response = await BaseService.getById({ url: Api.DEVICES, id });
    return response;
}

export const createDevice = async (payload: Partial<Device>) => {
    const response = await BaseService.post({ url: Api.DEVICES, payload });
    return response;
}

export const updateDevice = async (id: string, payload: Partial<Device>) => {
    const response = await BaseService.put({ url: `${Api.DEVICES}/${id}`, payload });
    return response;
}

export const deleteDevice = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.DEVICES}/${id}` })
    return response;
}
