import { BaseService } from "./base.service";
import { Api } from "@/constants/api.constant";
import { PagingParams, PagingResponse } from "@/types/paging";
import { OrderSummary } from "@/interfaces/dashboard";

export const getOrderSummary = async (params: PagingParams = {}): Promise<OrderSummary> => {
    const response = await BaseService.get<OrderSummary>({
        url: Api.ORDER_SUMMARY,
        payload: params,
    });
    console.log("Order Summary Service - Fetched Data:", response);
    // @ts-ignore
    return response.response;
};

// export const getKioskSummary = async (params: PagingParams = {}): Promise<PagingResponse<any>> => {
//     return BaseService.getPaging<any>({
//         url: Api.DASHBOARD + '/kiosk-summary',
//         payload: params,
//     });
// };