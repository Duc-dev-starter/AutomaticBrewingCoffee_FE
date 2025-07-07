import { useCrossTabSWR } from "@/lib/swr";
import { getKioskTypes } from "@/services/kiosk.service";
import { PagingParams } from "@/types/paging";

export function useKioskTypes(params: PagingParams) {
    return useCrossTabSWR(
        ["kioskTypes", params],
        () => getKioskTypes(params)
    );
}