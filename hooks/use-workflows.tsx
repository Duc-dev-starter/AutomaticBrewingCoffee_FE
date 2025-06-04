import { useCrossTabSWR } from "@/lib/swr";
import { getWorkflows } from "@/services/workflow";
import { PagingParams } from "@/types/paging";

export function useWorkflows(params: PagingParams) {
    return useCrossTabSWR(
        ["workflows", params],
        () => getWorkflows(params)
    );
}