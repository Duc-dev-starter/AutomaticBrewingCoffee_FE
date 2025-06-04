import { useCrossTabSWR } from "@/lib/swr";
import { getDevices } from "@/services/device";
import { PagingParams } from "@/types/paging";

export function useDevices(params: PagingParams) {
    return useCrossTabSWR(
        ["deviceTypes", params],
        () => getDevices(params)
    );
}