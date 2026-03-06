import axiosClient from "./axiosClient";

export const userApi = {
    signup(data){
        localStorage.removeItem("userData");
        return axiosClient.post('/users/signup',data);
    },
    sendVerification(data){
        return axiosClient.post('/users/sendVerification', data);
    },
    getUserById(id){
        return axiosClient.get(`/users/${id}`);
    },
    login(data){
        localStorage.removeItem("userData");
        return axiosClient.post('/users/login', data);   
    },
    logout(){
        return axiosClient.post('/users/logout');
    },
    refreshToken(){
        return axiosClient.post('/users/refresh');
    },

}