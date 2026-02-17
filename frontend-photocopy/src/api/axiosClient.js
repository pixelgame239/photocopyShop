import axios from "axios";
import { getAccessToken } from "../service/tokenService";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
    headers: { 'Content-Type': "application/json" }
});

axiosClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default axiosClient;