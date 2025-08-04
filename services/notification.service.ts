import { BaseService } from "./base.service"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api.constant";
import { ApiResponse } from "@/types/api";
import { Notification } from "@/interfaces/notification";

export const getNotifications = async (params: PagingParams = {}): Promise<PagingResponse<Notification>> => {
    return BaseService.getPaging<Notification>({
        url: Api.NOTIFICATIONS,
        payload: params,
    });
};

export const getNotification = async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await BaseService.getById({ url: Api.NOTIFICATIONS, id });
    return response;
};


export const markReadNotification = async (notificationId: string) => {
    const response = await BaseService.put({ url: `${Api.NOTIFICATIONS}/read-notification`, payload: { notificationId } });
    return response;
}

export const markReadNotifications = async (notificationIds: string[],) => {
    const response = await BaseService.put({ url: `${Api.NOTIFICATIONS}/read-notifications`, payload: { notificationIds } });
    return response;
}

