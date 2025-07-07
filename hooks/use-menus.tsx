import { useCrossTabSWR } from "@/lib/swr";
import { getMenus } from "@/services/menu.service";
import { PagingParams } from "@/types/paging";

export function useMenus(params: PagingParams) {
    return useCrossTabSWR(
        ["menus", params],
        () => getMenus(params)
    );
}