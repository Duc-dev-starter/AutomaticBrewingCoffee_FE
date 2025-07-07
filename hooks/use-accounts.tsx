import { useCrossTabSWR } from "@/lib/swr";
import { getAccounts } from "@/services/auth.service";
import { PagingParams } from "@/types/paging";

export function useAccounts(params: PagingParams) {
    return useCrossTabSWR(
        ["accounts", params],
        () => getAccounts(params)
    );
}