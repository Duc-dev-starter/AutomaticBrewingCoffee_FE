import { SyncEvent, SyncTask } from "@/interfaces/sync";
import { PagingParams, PagingResponse } from "@/types/paging";
import { BaseService } from "./base";
import { Api } from "@/constants/api";

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