import { useCrossTabSWR } from "@/lib/swr";
import { getKioskTypes } from "@/services/kiosk";
import { PagingParams } from "@/types/paging";

export function useKioskTypes(params: PagingParams) {
    return useCrossTabSWR(
        ["kioskTypes", params],
        () => getKioskTypes(params)
    );
}