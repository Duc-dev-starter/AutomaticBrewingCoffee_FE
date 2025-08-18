import { BaseService } from "./base.service";
import { Api } from "@/constants/api.constant";
import { PagingParams, PagingResponse } from "@/types/paging";
import { KioskSummary, OrderSummary, RevenueSummary } from "@/interfaces/dashboard";

export const getOrderSummary = async (params: PagingParams = {}): Promise<OrderSummary> => {
    const response = await BaseService.get<OrderSummary>({
        url: Api.ORDER_SUMMARY,
        payload: params,
    });
    console.log("Order Summary Service - Fetched Data:", response);
    // @ts-ignore
    return response.response;
};

export const getKioskSummary = async (params: PagingParams = {}): Promise<KioskSummary> => {
    const response = await BaseService.get<KioskSummary>({
        url: Api.KIOSK_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};

export const getRevenueSummary = async (params: PagingParams = {}): Promise<RevenueSummary> => {
    const response = await BaseService.get<RevenueSummary>({
        url: Api.ORDER_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};