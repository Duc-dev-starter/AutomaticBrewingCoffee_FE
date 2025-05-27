import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";
import { Product } from "@/interfaces/product";

export const getProducts = async (params: PagingParams = {}): Promise<PagingResponse<Product>> => {
    return BaseService.getPaging<Product>({
        url: Api.PRODUCTS,
        payload: params,
    });
};

export const getProduct = async (id: string) => {
    const response = await BaseService.getById({ url: Api.PRODUCTS, id });
    return response;
}

export const createProduct = async (payload: Partial<Product>) => {
    const response = await BaseService.post({ url: Api.PRODUCTS, payload });
    return response;
}

export const updateProduct = async (id: string, payload: Partial<Product>) => {
    const response = await BaseService.put({ url: `${Api.PRODUCTS}/${id}`, payload });
    return response;
}

export const deleteProduct = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.PRODUCTS}/${id}` })
    return response;
}


export const cloneProduct = async (productId: string) => {
    const response = await BaseService.post({ url: `${Api.PRODUCTS}/clone`, payload: { productId } });
    return response;
}