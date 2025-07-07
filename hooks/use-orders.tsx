import { useCrossTabSWR } from "@/lib/swr";
import { getOrders } from "@/services/order.service";
import { PagingParams } from "@/types/paging";

export function useOrders(params: PagingParams) {
    return useCrossTabSWR(
        ["orders", params],
        () => getOrders(params)
    );
}