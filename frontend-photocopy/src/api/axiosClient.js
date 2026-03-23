import axios from "axios";
import { getAccessToken } from "../service/tokenService";

const API_URL = import.meta.env.VITE_API_URL;
const axiosClient = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
    headers: { 'Content-Type': "application/json; charset=utf-8" }
});

axiosClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default axiosClient;