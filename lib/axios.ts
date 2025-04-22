import { HttpStatus } from "@/enum/http";
import axios from "axios";
import { toastService } from "@/utils";
import Cookies from "js-cookie"
import { refreshToken } from "@/services/auth";

export const axiosInstance = axios.create({
    baseURL: "https://localhost:7554/api/v1",
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000,
    timeoutErrorMessage: `Connection is timeout exceeded`
})

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
    (config) => {
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
        console.log(response);
        if (response.status === HttpStatus.Success || response.status === HttpStatus.Created) {
            return response.data;
        }
    },
    async (error) => {
        if (error.response) {
            const originalRequest = error.config;
            const { data } = error.response;

            // Xử lý lỗi 401
            if (error.response.status === HttpStatus.Unauthorized && !originalRequest._retry) {
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
                        window.location.href = '/login';
                    }, 5000)
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            else {
                switch (error.response.status) {
                    case HttpStatus.Forbidden: {
                        if (!isTokenExpired) {
                            isTokenExpired = true
                            toastService.show({
                                variant: "destructive",
                                title: "Hệ thống gặp trục trặc",
                                description: `${data.message || data.Message}`,
                            })
                            //   toast.error(data.message);
                            //   setTimeout(() => {
                            //     if (user) {
                            //       window.location.href = PATHS.HOME
                            //     } else {
                            //       return;
                            //     }
                            //     localStorage.clear();
                            //     isTokenExpired = false;
                            //   }, 1300);
                        }
                        break;
                    }

                    case HttpStatus.NotFound:
                        toastService.show({
                            variant: "destructive",
                            title: "Hệ thống gặp trục trặc",
                            description: `${data.message || data.Message}`,
                        })
                        // toast.error(data.message || data.Message);
                        //     switch(user.role){
                        //       case "member":
                        //         window.location.href = Path.NOTFOUND;
                        //         break;
                        //       case "admin":
                        //         window.location.href = '/admin/404';
                        //         break;

                        //       case "staff":
                        //         window.location.href = "/staff/404";
                        //         break;
                        //       default:
                        //         window.location.href = Path.HOME;
                        //         break;
                        //     }
                        break;

                    case HttpStatus.InternalServerError:
                        toastService.show({
                            variant: "destructive",
                            title: "Hệ thống gặp trục trặc",
                            description: `${data.message || data.Message || data}`,
                        })
                        // window.location.href = WebPath.INTERNAL_SERVER_ERROR;
                        break;

                    default:
                        toastService.show({
                            variant: "destructive",
                            title: "Hệ thống gặp trục trặc",
                            description: `${data.message || data.Message}`,
                        })
                        break;
                }
            }

            return Promise.reject(error.response.data);
        } else {
            //   toast.error('Network error');
            return Promise.reject(error);
        }
    }
);