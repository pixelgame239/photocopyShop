import axiosClient from "./axiosClient";

export const userApi = {
    signup(data){
        localStorage.removeItem("userData");
        return axiosClient.post('/users/signup',data);
    },
    sendVerification(data){
        return axiosClient.post('/users/sendVerification', data);
    },
    updateProfile(data){
        return axiosClient.patch('/users/updateProfile', data);
    },
    changePassword(data){
        return axiosClient.patch('/users/changePassword', data);
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
    sendResetPasswordEmail(email){
        return axiosClient.post('/users/sendResetPasswordEmail', { email: email });
    }
}