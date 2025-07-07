import { useCrossTabSWR } from "@/lib/swr";
import { getCategories } from "@/services/category.service";
import { PagingParams } from "@/types/paging";

export function useCategories(params: PagingParams) {
    return useCrossTabSWR(
        ["categories", params],
        () => getCategories(params)
    );
}