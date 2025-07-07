import { useCrossTabSWR } from "@/lib/swr";
import { getSyncEvents } from "@/services/sync.service";
import { PagingParams } from "@/types/paging";

export function useSyncEvents(params: PagingParams) {
    return useCrossTabSWR(
        ["syncEvents", params],
        () => getSyncEvents(params)
    );
}