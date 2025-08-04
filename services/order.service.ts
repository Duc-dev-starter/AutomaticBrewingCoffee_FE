import { BaseService } from "./base.service"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Order } from "@/interfaces/order";
import { Api } from "@/constants/api.constant";

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

export const refundOrder = async (orderId: string, payload: { content: string, refundAmount: number }) => {
    const response = await BaseService.put({ url: `${Api.ORDERS}/${orderId}/refund`, payload });
    return response;
}
