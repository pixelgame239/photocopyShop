import axiosClient from "./axiosClient";

export const mailApi = {
    sendVerificationMail(data){
        return axiosClient.post('/mail/sendVerification', data);
    },
    testMail(){
        return axiosClient.post('/mail/test');
    }
}