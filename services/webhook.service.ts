import { BaseService } from "./base.service";

export const registerWebhook = async (payload: { kioskId: string, webhookUrl: string, webhookType: string }) => {
    const response = await BaseService.post({ url: `/webhooks`, payload });
    return response;
}

export const updateWebhook = async (webhookId: string, payload: { webhookUrl: string }) => {
    const response = await BaseService.put({ url: `/webhooks/${webhookId}`, payload });
    return response;
}