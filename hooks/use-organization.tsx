import { useCrossTabSWR } from "@/lib/swr";
import { getOrganizations } from "@/services/organization";
import { PagingParams } from "@/types/paging";

export function useOrganizations(params: PagingParams) {
    return useCrossTabSWR(
        ["organizations", params],
        () => getOrganizations(params)
    );
}