import { useCrossTabSWR } from "@/lib/swr";
import { getOrderSummary } from "@/services/dashboard.service";
import { PagingParams } from "@/types/paging";

export function useOrderSummary(params: PagingParams) {
    return useCrossTabSWR(
        ["orderSummary", params],
        () => getOrderSummary(params)
    );
}