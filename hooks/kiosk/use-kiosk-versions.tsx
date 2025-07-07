import { useCrossTabSWR } from "@/lib/swr";
import { getKioskVersions } from "@/services/kiosk.service";
import { PagingParams } from "@/types/paging";

export function useKioskVersions(params: PagingParams) {
    return useCrossTabSWR(
        ["kioskVersions", params],
        () => getKioskVersions(params)
    );
}