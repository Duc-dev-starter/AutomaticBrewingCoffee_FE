import { useCrossTabSWR } from "@/lib/swr";
import { getIngredientTypes } from "@/services/ingredientType.service";
import { PagingParams } from "@/types/paging";

export function useIngredientTypes(params: PagingParams) {
    return useCrossTabSWR(
        ["ingredientTypes", params],
        () => getIngredientTypes(params)
    );
}