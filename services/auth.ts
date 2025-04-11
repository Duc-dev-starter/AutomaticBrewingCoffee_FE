import { BaseService } from "./base"

export const login = async (payload: { username: string, password: string }) => {
    const response = await BaseService.post({ url: '/auth/login', payload })
    return response;
}

export const getNewAccessToken = async (payload: { refreshToken: string }) => {
    const response = await BaseService.post({ url: '/auth/refresh', payload })
    return response;
}