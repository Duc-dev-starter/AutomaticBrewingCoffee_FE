import { ApiResponse } from "@/types/api";
import { BaseService } from "./base"
import { Api } from "@/constants/api";

export const login = async (payload: { email: string; password: string }): Promise<ApiResponse> => {
    const response = await BaseService.post<ApiResponse>({ url: Api.LOGIN, payload });
    return response;
};


export const getNewAccessToken = async (payload: { refreshToken: string }) => {
    const response = await BaseService.post({ url: Api.REFRESH_TOKEN, payload })
    return response;
}   