import { useCrossTabSWR } from "@/lib/swr";
import { getSyncTasks } from "@/services/sync";
import { PagingParams } from "@/types/paging";

export function useSyncTasks(params: PagingParams) {
    return useCrossTabSWR(
        ["syncTasks", params],
        () => getSyncTasks(params)
    );
}