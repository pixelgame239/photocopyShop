import { useNavigate } from "react-router-dom";
import axiosClient  from "../api/axiosClient";
import { setAccessToken, clearAccessToken } from "./tokenService";
import { useEffect } from "react";

export const useAxiosInterceptor = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const responseInterceptor = axiosClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (!error.response || originalRequest._retry) {
                    return Promise.reject(error);
                }

                if (error.response.status === 401) {
                    originalRequest._retry = true;

                    try {
                        // Gọi refresh token
                        const res = await axiosClient.post("/users/refresh");
                        const newAccessToken = res.data.accessToken;
                        
                        setAccessToken(newAccessToken);
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        
                        return axiosClient(originalRequest);
                    } catch (refreshError) {
                        // Nếu refresh cũng lỗi -> đá về login
                        clearAccessToken();
                        navigate("/login"); // ✅ Dùng thoải mái vì đang ở trong Hook
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Cleanup: Xóa interceptor khi component unmount để tránh trùng lặp
        return () => {
            axiosClient.interceptors.response.eject(responseInterceptor);
        };
    }, [navigate]);
};