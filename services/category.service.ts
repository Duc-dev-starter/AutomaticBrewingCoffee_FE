import { Category } from "@/interfaces/category";
import { PagingParams, PagingResponse } from "@/types/paging";
import { BaseService } from "./base.service";
import { Api } from "@/constants/api.constant";

export const getCategories = async (params: PagingParams = {}): Promise<PagingResponse<Category>> => {
    return BaseService.getPaging<Category>({
        url: Api.CATEGORIES,
        payload: params,
    });
};

export const getCategory = async (id: string) => {
    const response = await BaseService.getById({ url: Api.CATEGORIES, id });
    return response;
}

export const createCategory = async (payload: Partial<Category>) => {
    const response = await BaseService.post({ url: Api.CATEGORIES, payload });
    return response;
}

export const updateCategory = async (id: string, payload: Partial<Category>) => {
    const response = await BaseService.put({ url: `${Api.CATEGORIES}/${id}`, payload });
    return response;
}

export const deleteCategory = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.CATEGORIES}/${id}` })
    return response;
}

export const reorderCategory = async (payload: { dragProductCategoryId: string, targetProductCategoryId: string, insertAfter: boolean }) => {
    const response = await BaseService.put({ url: `${Api.CATEGORIES}/reorder`, payload });
    return response;
}
