import { SyncEvent, SyncTask } from "@/interfaces/sync";
import { PagingParams, PagingResponse } from "@/types/paging";
import { BaseService } from "./base.service";
import { Api } from "@/constants/api.constant";

export const getSyncEvents = async (params: PagingParams = {}): Promise<PagingResponse<SyncEvent>> => {
    return BaseService.getPaging<SyncEvent>({
        url: `${Api.SYNCS}/events`,
        payload: params,
    });
};

export const getSyncTasks = async (params: PagingParams = {}): Promise<PagingResponse<SyncTask>> => {
    return BaseService.getPaging<SyncTask>({
        url: `${Api.SYNCS}/tasks`,
        payload: params,
    });
};

export const syncOverrideKiosk = async (kioskId: string) => {
    const response = await BaseService.post({ url: `/syncs/override-kiosk?kioskId=${kioskId}` });
    return response;
}

export const syncKiosk = async (kioskId: string) => {
    const response = await BaseService.post({ url: `${Api.SYNCS}/sync-kiosk?kioskId=${kioskId}` });
    return response;
}