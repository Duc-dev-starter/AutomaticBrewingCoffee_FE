import { useCrossTabSWR } from "@/lib/swr";
import { getKioskSummary, getOrderSummary, getRevenueSummary } from "@/services/dashboard.service";
import { PagingParams } from "@/types/paging";

export function useOrderSummary(params: PagingParams) {
    return useCrossTabSWR(
        ["orderSummary", params],
        () => getOrderSummary(params)
    );
}

export function useKioskSummary(params: PagingParams) {
    return useCrossTabSWR(
        ["kioskSummary", params],
        () => getKioskSummary(params)
    );
}

export function useRevenueSummary(params: PagingParams) {
    return useCrossTabSWR(
        ["revenueSummary", params],
        () => getRevenueSummary(params)
    );
}

export function useDashboardSummary(params: PagingParams) {
    const order = useOrderSummary(params);
    const kiosk = useKioskSummary(params);
    const revenue = useRevenueSummary(params);

    console.log(order)

    return {
        order,
        kiosk,
        revenue,
        isLoading: order.isLoading || kiosk.isLoading || revenue.isLoading,
        error: order.error || kiosk.error || revenue.error,
    };
}
