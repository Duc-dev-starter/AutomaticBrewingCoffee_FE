import { useCrossTabSWR } from "@/lib/swr";
import { getKiosks } from "@/services/kiosk.service";
import { PagingParams } from "@/types/paging";

export function useKiosks(params: PagingParams) {
    return useCrossTabSWR(
        ["kiosks", params],
        () => getKiosks(params)
    );
}