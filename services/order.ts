import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Order } from "@/types/order";
import { Api } from "@/constants/api";

export const getOrders = async (params: PagingParams = {}): Promise<PagingResponse<Order>> => {
    return BaseService.getPaging<Order>({
        url: Api.ORDERS,
        payload: params,
    });
};

export const getOrder = async (id: string) => {
    const response = await BaseService.getById({ url: Api.ORDERS, id });
    return response;
}

export const createOrder = async (payload: Partial<Order>) => {
    const response = await BaseService.post({ url: Api.ORDERS, payload });
    return response;
}

export const updateOrder = async (id: string, payload: Partial<Order>) => {
    const response = await BaseService.put({ url: `${Api.ORDERS}/${id}`, payload });
    return response;
}

export const deleteOrder = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.ORDERS}/${id}` })
    return response;
}
