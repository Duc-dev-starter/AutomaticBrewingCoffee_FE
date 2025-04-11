import { BaseService } from "./base"

export const getDevices = async () => {
    const response = await BaseService.get({ url: `/devices` })
    return response;
}