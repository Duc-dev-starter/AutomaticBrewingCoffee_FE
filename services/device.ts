import { Device, DeviceModel, DeviceType } from "@/interfaces/device";
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


export const getDeviceTypes = async (params: PagingParams = {}): Promise<PagingResponse<DeviceType>> => {
    return BaseService.getPaging<DeviceType>({
        url: Api.DEVICE_TYPES,
        payload: params,
    });
};

export const getDeviceType = async (id: string) => {
    const response = await BaseService.getById({ url: Api.DEVICE_TYPES, id });
    return response;
}

export const createDeviceType = async (payload: Partial<DeviceType>) => {
    const response = await BaseService.post({ url: Api.DEVICE_TYPES, payload });
    return response;
}

export const updateDeviceType = async (id: string, payload: Partial<DeviceType>) => {
    const response = await BaseService.put({ url: `${Api.DEVICE_TYPES}/${id}`, payload });
    return response;
}

export const deleteDeviceType = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.DEVICE_TYPES}/${id}` })
    return response;
}


export const getDeviceModels = async (params: PagingParams = {}): Promise<PagingResponse<DeviceModel>> => {
    return BaseService.getPaging<DeviceModel>({
        url: Api.DEVICE_MODELS,
        payload: params,
    });
};

export const getDeviceModel = async (id: string) => {
    const response = await BaseService.getById({ url: Api.DEVICE_MODELS, id });
    return response;
}

export const createDeviceModel = async (payload: Partial<DeviceModel>) => {
    const response = await BaseService.post({ url: Api.DEVICE_MODELS, payload });
    return response;
}

export const updateDeviceModel = async (id: string, payload: Partial<DeviceModel>) => {
    const response = await BaseService.put({ url: `${Api.DEVICE_MODELS}/${id}`, payload });
    return response;
}

export const deleteDeviceModel = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.DEVICE_MODELS}/${id}` })
    return response;
}


export const getDevicesToReplace = async (deviceId: string, params: PagingParams = {}): Promise<PagingResponse<Device>> => {
    return BaseService.getPaging<Device>({
        url: `${Api.DEVICES}/${deviceId}/replace`,
        payload: params,
    });
};