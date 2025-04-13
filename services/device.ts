import { Device } from "@/types/device";
import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";

export const getDevices = async (params: PagingParams = {}): Promise<PagingResponse<Device>> => {
    return BaseService.getPaging<Device>({
        url: `/devices`,
        payload: params,
    });
};

export const getDevice = async (id: string) => {
    const response = await BaseService.getById({ url: '/devices', id });
    return response;
}

export const createDevice = async (payload: Partial<Device>) => {
    const response = await BaseService.post({ url: '/devices', payload });
    return response;
}

export const updateDevice = async (id: string, payload: Partial<Device>) => {
    const response = await BaseService.put({ url: `/devices/${id}`, payload });
    return response;
}

export const deleteDevice = async (id: string) => {
    const response = await BaseService.delete({ url: '/devices' })
    return response;
}
