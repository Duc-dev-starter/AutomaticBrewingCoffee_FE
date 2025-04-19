import { ApiResponse } from "@/types/api";
import { BaseService } from "./base"
import { Api } from "@/constants/api";
import { handleToken } from "@/utils/cookie";
import Cookies from 'js-cookie'

export const login = async (payload: { email: string; password: string }): Promise<ApiResponse> => {
    const response = await BaseService.post<ApiResponse>({ url: Api.LOGIN, payload });
    return response;
};


export const refreshToken = async () => {
    try {
        const currentRefreshToken = Cookies.get('refreshToken');
        if (!currentRefreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await BaseService.post({
            url: Api.REFRESH_TOKEN, payload: {
                refreshToken: currentRefreshToken
            }
        });

        if (response.isSuccess && response.statusCode === 200) {
            const { accessToken, refreshToken: newRefreshToken } = response.response;
            handleToken(accessToken, newRefreshToken);
            return accessToken;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};