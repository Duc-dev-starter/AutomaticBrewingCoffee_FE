import { BaseService } from "./base.service"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Order } from "@/interfaces/order";
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
