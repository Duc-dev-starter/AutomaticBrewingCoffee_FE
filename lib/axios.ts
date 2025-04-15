import { HttpStatus } from "@/enum/http";
import WebPath from "@/constants/path";
import axios from "axios";
import { toastService } from "@/utils";

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
        const token = localStorage.getItem("token");
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
            if (data.errors && data.errors.length > 0) {
                data.errors.forEach((error: { field: string, message: string[] }) => {
                    const errorMessage = error.message.join(', ');
                    //   toast.error(`${error.field}: ${errorMessage}`);
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