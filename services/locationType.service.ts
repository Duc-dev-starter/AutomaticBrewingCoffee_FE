import { BaseService } from "./base.service"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";
import { LocationType } from "@/interfaces/location";

export const getLocationTypes = async (params: PagingParams = {}): Promise<PagingResponse<LocationType>> => {
    return BaseService.getPaging<LocationType>({
        url: Api.LOCATION_TYPES,
        payload: params,
    });
};

export const getLocationType = async (id: string) => {
    const response = await BaseService.getById({ url: Api.LOCATION_TYPES, id });
    return response;
}

export const createLocationType = async (payload: Partial<LocationType>) => {
    const response = await BaseService.post({ url: Api.LOCATION_TYPES, payload });
    return response;
}

export const updateLocationType = async (id: string, payload: Partial<LocationType>) => {
    const response = await BaseService.put({ url: `${Api.LOCATION_TYPES}/${id}`, payload });
    return response;
}

export const deleteLocationType = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.LOCATION_TYPES}/${id}` })
    return response;
}
