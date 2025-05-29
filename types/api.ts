import { ResponseType } from "axios";

export interface ApiResponse<T = any> {
    isSuccess: boolean;
    message: string;
    request: object | null;
    response: T;
    statusCode: number;
};



export interface ApiRequest {
    url: string;
    payload?: any;
    headers?: object;
    responseType?: ResponseType;
}