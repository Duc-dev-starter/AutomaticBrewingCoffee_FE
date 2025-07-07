import { useCrossTabSWR } from "@/lib/swr";
import { getDeviceTypes } from "@/services/device.service";
import { PagingParams } from "@/types/paging";

export function useDeviceTypes(params: PagingParams) {
    return useCrossTabSWR(
        ["deviceTypes", params],
        () => getDeviceTypes(params)
    );
}