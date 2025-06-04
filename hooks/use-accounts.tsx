import { useCrossTabSWR } from "@/lib/swr";
import { getAccounts } from "@/services/auth";
import { PagingParams } from "@/types/paging";

export function useAccounts(params: PagingParams) {
    return useCrossTabSWR(
        ["accounts", params],
        () => getAccounts(params)
    );
}