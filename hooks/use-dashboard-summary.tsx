import { useCrossTabSWR } from "@/lib/swr";
import { getAccountSummary, getHourlyPeak, getKioskSummary, getOrderSummary, getOrderTrafficSummary, getOrganizationSummary, getRevenueSummary, getStoreSummary } from "@/services/dashboard.service";
import { useAppStore } from "@/stores/use-app-store";
import { DashboardParams } from "@/types/dashboard";


export function useOrderSummary(params: DashboardParams) {
    return useCrossTabSWR(
        ["orderSummary", params],
        () => getOrderSummary(params)
    );
}

export function useKioskSummary(params: DashboardParams) {
    return useCrossTabSWR(
        ["kioskSummary", params],
        () => getKioskSummary(params)
    );
}

export function useRevenueSummary(params: DashboardParams) {
    return useCrossTabSWR(
        ["revenueSummary", params],
        () => getRevenueSummary(params)
    );
}

export function useAccountSummary(params: DashboardParams, roleName?: string) {
    return useCrossTabSWR(
        roleName === "Organization" ? [] : ["accountSummary", params],
        () => getAccountSummary(params)
    )
}

export function useOrganizationSummary(params: DashboardParams, roleName?: string) {
    return useCrossTabSWR(
        roleName === "Organization" ? [] : ["organizationSummary", params],
        () => getOrganizationSummary(params)
    )
}

export function useOrderTrafficSummary(params: DashboardParams) {
    return useCrossTabSWR(
        ["orderTraffic", params],
        () => getOrderTrafficSummary(params)
    );
}

export function useStoreSummary(params: DashboardParams) {
    return useCrossTabSWR(
        ["storeSummary", params],
        () => getStoreSummary(params)
    );
}

export function useHourlyPeak(params: DashboardParams) {
    return useCrossTabSWR(
        ["hourlyPeak", params],
        () => getHourlyPeak(params)
    );
}

export function useDashboardSummary(params: DashboardParams) {
    const { account: appAccount } = useAppStore();

    const order = useOrderSummary(params);
    const kiosk = useKioskSummary(params);
    const revenue = useRevenueSummary(params);
    const orderTraffic = useOrderTrafficSummary(params);
    const account = useAccountSummary(params, appAccount?.roleName);
    const store = useStoreSummary(params);
    const organization = useOrganizationSummary(params, appAccount?.roleName);
    const hourlyPeak = useHourlyPeak(params);


    return {
        order,
        kiosk,
        revenue,
        orderTraffic,
        account,
        store,
        organization,
        hourlyPeak,

        isLoading: order.isLoading || kiosk.isLoading || revenue.isLoading || orderTraffic.isLoading || account.isLoading || store.isLoading || organization.isLoading || hourlyPeak.isLoading,
        error: order.error || kiosk.error || revenue.error || orderTraffic.error || account.error || store.error || organization.error || hourlyPeak.error,
    };
}
