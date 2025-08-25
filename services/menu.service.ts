import { BaseService } from "./base.service"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api.constant";
import { Menu, MenuProductMapping } from "@/interfaces/menu";
import { EBaseStatus } from "@/enum/base";
import { ApiResponse } from "@/types/api";
import { MenuDetailType } from "@/app/(admin)/manage-menus/[slug]/page";

export const getMenus = async (params: PagingParams = {}): Promise<PagingResponse<Menu>> => {
    return BaseService.getPaging<Menu>({
        url: Api.MENUS,
        payload: params,
    });
};

export const getMenu = async (id: string): Promise<ApiResponse<MenuDetailType>> => {
    const response = await BaseService.getById({ url: Api.MENUS, id });
    return response;
};


export const createMenu = async (payload: Partial<Menu>) => {
    const response = await BaseService.post({ url: Api.MENUS, payload });
    return response;
}

export const updateMenu = async (id: string, payload: Partial<Menu>) => {
    const response = await BaseService.put({ url: `${Api.MENUS}/${id}`, payload });
    return response;
}

export const deleteMenu = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.MENUS}/${id}` })
    return response;
}

export const getMenuProducts = async (params: PagingParams = {}): Promise<PagingResponse<MenuProductMapping>> => {
    return BaseService.getPaging<MenuProductMapping>({
        url: Api.MENU_PRODUCTS,
        payload: params,
    });
};

export const addProductToMenu = async (payload: { menuId: string, productId: string, status: EBaseStatus }): Promise<PagingResponse<MenuProductMapping>> => {
    return BaseService.post({ url: `${Api.MENUS}${Api.MENU_PRODUCTS}`, payload });
}

export const updateProductToMenu = async (menuId: string, productId: string, payload: { status: EBaseStatus, sellingPrice: string }) => {
    return BaseService.put({ url: `${Api.MENUS}/${menuId}${Api.MENU_PRODUCTS}/${productId}`, payload });
}

export const removeProductFromMenu = async (menuId: string, productId: string) => {
    const response = await BaseService.delete({ url: `${Api.MENUS}/${menuId}${Api.MENU_PRODUCTS}/${productId}` })
    return response;
}

export const reorderMenuProducts = async (menuId: string, payload: { dragProductId: string, targetProductId: string, insertAfter: boolean }) => {
    const response = await BaseService.put({ url: `${Api.MENUS}/${menuId}${Api.MENU_PRODUCTS}/reorder`, payload })
    return response;
}

export const cloneMenu = async (menuId: string) => {
    const response = await BaseService.post({ url: `${Api.MENUS}/clone`, payload: { menuId } });
    return response;
}