import { useCrossTabSWR } from "@/lib/swr";
import { getProducts } from "@/services/product.service";
import { PagingParams } from "@/types/paging";

export function useProducts(params: PagingParams) {
    return useCrossTabSWR(
        ["products", params],
        () => getProducts(params)
    );
}