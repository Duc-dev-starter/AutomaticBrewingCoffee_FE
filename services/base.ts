import { AxiosResponse } from "axios";
import { cleanParams } from "@/utils";
import { axiosInstance } from "@/lib/axios";
import { PagingResponse } from "@/types/paging";
import { ApiRequest, ApiResponse } from "@/types/api";

export const BaseService = {
    async get<T = any>({ url, payload, headers }: ApiRequest): Promise<AxiosResponse<T>> {
        if (!url) {
            throw new Error("URL is required for GET request");
        }
        try {
            const params = cleanParams({ ...payload });
            const response = await axiosInstance.get<T, AxiosResponse<T>>(url, {
                params,
                headers: headers || {},
            });
            return response;
        } catch (error) {
            // Handle error if needed, e.g., dispatch error action
            console.error("GET request failed", error);
            throw error;
        }
    },

    async getPaging<T = any>({ url, payload, headers }: ApiRequest): Promise<PagingResponse<T>> {
        if (!url) throw new Error("URL is required for GET request");
        try {
            const params = cleanParams({ ...payload });
            const data = await axiosInstance.get<any>(url, {
                params,
                headers: headers || {},
            }) as any;
            return data.response;
        } catch (error) {
            console.error("GET request failed", error);
            throw error;
        }
    },


    async post<T = any>({ url, payload, headers }: ApiRequest): Promise<T> {
        if (!url) throw new Error("URL is required for POST request");
        try {
            const data = await axiosInstance.post<T, T>(url, payload, {
                headers: headers || {},
            });
            return data;
        } catch (error) {
            console.error("POST request failed", error);
            throw error;
        }
    },

    async put<T = any>({ url, payload, headers }: ApiRequest): Promise<AxiosResponse<T>> {
        if (!url) {
            throw new Error("URL is required for PUT request");
        }
        try {
            const response = await axiosInstance.put<T, AxiosResponse<T>>(url, payload, {
                headers: headers || {},
            });
            return response;
        } catch (error) {
            console.error("PUT request failed", error);
            throw error;
        }
    },

    async delete<T = any>({ url, payload, headers }: ApiRequest): Promise<AxiosResponse<T>> {
        if (!url) {
            throw new Error("URL is required for DELETE request");
        }
        try {
            const params = cleanParams({ ...payload });
            const response = await axiosInstance.delete<T, AxiosResponse<T>>(url, {
                params,
                headers: headers || {},
            });
            console.log(response);
            return response;
        } catch (error) {
            console.error("DELETE request failed", error);
            throw error;
        }
    },

    async getById<T = any>({ url, id, headers }: { url: string; id: string | number; headers?: any }): Promise<ApiResponse<T>> {
        try {
            const response = await axiosInstance.get<T, ApiResponse<T>>(`${url}/${id}`, {
                headers: headers || {},
            });
            return response;
        } catch (error) {
            console.error("GET by ID request failed", error);
            throw error;
        }
    }
};