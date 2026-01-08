import axiosClient from "./axiosClient";

export const userApi = {
    createUser(data){
        return axiosClient.post('/users/signup',data);
    },
    getUserById(id){
        return axiosClient.get(`/users/${id}`);
    }
}