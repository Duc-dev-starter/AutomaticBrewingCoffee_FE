import { useCrossTabSWR } from "@/lib/swr";
import { getNotifications } from "@/services/notification.service";
import { PagingParams } from "@/types/paging";

export function useNotifications(params: PagingParams) {
    return useCrossTabSWR(
        ["notifications", params],
        () => getNotifications(params)
    );
}