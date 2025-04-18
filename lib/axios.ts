import { HttpStatus } from "@/enum/http";
import axios from "axios";
import { toastService } from "@/utils";
import Cookies from "js-cookie"

export const axiosInstance = axios.create({
    baseURL: "https://localhost:7554/api/v1",
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000,
    timeoutErrorMessage: `Connection is timeout exceeded`
})

let isTokenExpired = false;
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
    (error) => {
        if (error.response) {
            const { data } = error.response;
            console.log(error.response);
            if (data.errors && typeof data.errors === 'object') {
                const messages = Object.entries(data.errors)
                    .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                    .join('\n');

                toastService.show({
                    variant: "destructive",
                    title: "Hệ thống gặp trục trặc",
                    description: messages,
                });
            }

            else {
                switch (error.response.status) {
                    case HttpStatus.Unauthorized:
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