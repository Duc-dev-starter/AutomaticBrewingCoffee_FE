import { HttpStatus } from "@/enum/http";
import axios from "axios";
import { toastService } from "@/utils";
import Cookies from "js-cookie";
import { refreshToken } from "@/services/auth";
import { accessTokenAlmostExpired } from "@/utils/cookie";

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000,
    timeoutErrorMessage: `Connection is timeout exceeded`
});

let isTokenExpired = false;
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.request.use(
    async (config) => {
        if (accessTokenAlmostExpired(120)) {
            try {
                await refreshToken();
            } catch (err) {
                console.error("Refresh token failed in request interceptor", err);
            }
        }
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        if (
            response.status === HttpStatus.Success ||
            response.status === HttpStatus.Created ||
            response.status === HttpStatus.Accepted
        ) {
            return response.data;
        }
    },
    async (error) => {
        if (error.response) {
            const originalRequest = error.config;
            const { data } = error.response;

            // Xử lý lỗi 401 khi login: Báo đăng nhập sai
            if (
                error.response.status === HttpStatus.Unauthorized &&
                originalRequest?.url?.includes("/login")
            ) {
                toastService.show({
                    title: "Đăng nhập thất bại",
                    description: "Email hoặc mật khẩu không đúng.",
                    variant: "destructive",
                });
                return Promise.reject(error);
            }

            // Xử lý lỗi 401 và refresh token (nếu cần)
            if (
                error.response.status === HttpStatus.Unauthorized &&
                !originalRequest._retry &&
                error.response?.message?.includes("mã làm mới")
            ) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            return axiosInstance(originalRequest);
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const newAccessToken = await refreshToken();
                    processQueue(null, newAccessToken);
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest); // Thử lại request ban đầu
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    setTimeout(() => {
                        toastService.show({
                            title: "Hệ thống gặp trục trặc",
                            description: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
                        });
                        // window.location.href = '/login';
                    }, 5000);
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                switch (error.response.status) {
                    case HttpStatus.Forbidden: {
                        if (!isTokenExpired) {
                            isTokenExpired = true;
                            toastService.show({
                                variant: "destructive",
                                title: "Hệ thống gặp trục trặc",
                                description: `${data.message || data.Message}`,
                            });
                        }
                        break;
                    }

                    case HttpStatus.NotFound:
                        toastService.show({
                            variant: "destructive",
                            title: "Hệ thống gặp trục trặc",
                            description: `${data.message || data.Message}`,
                        });
                        break;

                    case HttpStatus.InternalServerError:
                        toastService.show({
                            variant: "destructive",
                            title: "Hệ thống gặp trục trặc",
                            description: `${data.message || data.Message || data}`,
                        });
                        break;

                    default:
                        toastService.show({
                            variant: "destructive",
                            title: "Hệ thống gặp trục trặc",
                            description: `${data.message || data.Message || "Server bị lỗi"}`,
                        });
                        break;
                }
            }

            return Promise.reject(error.response.data);
        } else {
            // Network error
            return Promise.reject(error);
        }
    }
);