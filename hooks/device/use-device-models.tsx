import { useCrossTabSWR } from "@/lib/swr";
import { getDeviceModels } from "@/services/device.service";
import { PagingParams } from "@/types/paging";

export function useDeviceModels(params: PagingParams) {
    return useCrossTabSWR(
        ["deviceModels", params],
        () => getDeviceModels(params)
    );
}