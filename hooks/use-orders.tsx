import { useCrossTabSWR } from "@/lib/swr";
import { getOrders } from "@/services/order";
import { PagingParams } from "@/types/paging";

export function useOrders(params: PagingParams) {
    return useCrossTabSWR(
        ["workflows", params],
        () => getOrders(params)
    );
}