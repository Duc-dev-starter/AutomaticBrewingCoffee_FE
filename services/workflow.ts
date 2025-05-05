import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";
import { ApiResponse } from "@/types/api";
import { Workflow } from "@/interfaces/workflow";

export const getWorkflows = async (params: PagingParams = {}): Promise<PagingResponse<Workflow>> => {
    return BaseService.getPaging<Workflow>({
        url: Api.WORKFLOWS,
        payload: params,
    });
};

export const getWorkflow = async (id: string): Promise<ApiResponse<Workflow>> => {
    const response = await BaseService.getById({ url: Api.WORKFLOWS, id });
    return response;
};


export const createWorkflow = async (payload: Partial<Workflow>) => {
    const response = await BaseService.post({ url: Api.WORKFLOWS, payload });
    return response;
}

export const updateWorkflow = async (id: string, payload: Partial<Workflow>) => {
    const response = await BaseService.put({ url: `${Api.WORKFLOWS}/${id}`, payload });
    return response;
}

export const deleteWorkflow = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.WORKFLOWS}/${id}` })
    return response;
}

