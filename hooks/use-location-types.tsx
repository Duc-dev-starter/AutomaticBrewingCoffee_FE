import { useCrossTabSWR } from "@/lib/swr";
import { getLocationTypes } from "@/services/locationType";
import { PagingParams } from "@/types/paging";

export function useLocationTypes(params: PagingParams) {
    return useCrossTabSWR(
        ["locationTypes", params],
        () => getLocationTypes(params)
    );
}