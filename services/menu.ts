import { Device } from "@/interfaces/device";
import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";
import { Menu } from "@/interfaces/menu";

export const getMenus = async (params: PagingParams = {}): Promise<PagingResponse<Menu>> => {
    return BaseService.getPaging<Menu>({
        url: Api.MENUS,
        payload: params,
    });
};

export const getMenu = async (id: string) => {
    const response = await BaseService.getById({ url: Api.MENUS, id });
    return response;
}

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
