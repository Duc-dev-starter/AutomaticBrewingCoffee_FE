import { BaseService } from "./base.service";
import { Api } from "@/constants/api.constant";
import { AccountSummary, HourlyPeak, KioskSummary, OrderSummary, OrderTrafficSummary, OrganizationSummary, RevenueSummary, StoreSummary } from "@/interfaces/dashboard";
import { DashboardParams } from "@/types/dashboard";


export const getOrderSummary = async (params: DashboardParams = {}): Promise<OrderSummary> => {
    const response = await BaseService.get<OrderSummary>({
        url: Api.ORDER_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};

export const getKioskSummary = async (params: DashboardParams = {}): Promise<KioskSummary> => {
    const response = await BaseService.get<KioskSummary>({
        url: Api.KIOSK_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};

export const getRevenueSummary = async (params: DashboardParams = {}): Promise<RevenueSummary> => {
    const response = await BaseService.get<RevenueSummary>({
        url: Api.REVENUE_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};

export const getAccountSummary = async (params: DashboardParams = {}): Promise<AccountSummary> => {
    const response = await BaseService.get<AccountSummary>({
        url: Api.ACCOUNT_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};

export const getStoreSummary = async (params: DashboardParams = {}): Promise<StoreSummary> => {
    const response = await BaseService.get<StoreSummary>({
        url: Api.STORE_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};

export const getOrganizationSummary = async (params: DashboardParams = {}): Promise<OrganizationSummary> => {
    const response = await BaseService.get<OrganizationSummary>({
        url: Api.ORGANIZATION_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};

export const getOrderTrafficSummary = async (params: DashboardParams = {}): Promise<OrderTrafficSummary> => {
    const response = await BaseService.get<OrderTrafficSummary>({
        url: Api.ORDER_TRAFFIC_SUMMARY,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};

export const getHourlyPeak = async (params: DashboardParams = {}): Promise<HourlyPeak> => {
    const response = await BaseService.get<HourlyPeak>({
        url: Api.HOURLY_PEAK,
        payload: params,
    });
    // @ts-ignore
    return response.response;
};