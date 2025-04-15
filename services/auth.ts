import { ApiResponse } from "@/types/api";
import { BaseService } from "./base"

export const login = async (payload: { username: string; password: string }): Promise<ApiResponse> => {
    const response = await BaseService.post<ApiResponse>({ url: "/auth/login", payload });
    return response;
};


export const getNewAccessToken = async (payload: { refreshToken: string }) => {
    const response = await BaseService.post({ url: '/auth/refresh', payload })
    return response;
}   