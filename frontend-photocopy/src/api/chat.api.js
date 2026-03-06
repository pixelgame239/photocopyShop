import axiosClient from "./axiosClient";

const chatApi = {
    getStaffBoxChat: async () => {
        return await axiosClient.get('/chat/staff/getBoxChats');
    },
    getUserBoxChat: async (userFullName) => {
        return await axiosClient.get(`/chat/getBoxChatStatus/${userFullName}`);
    },
    markBoxChatAsRead: async (userFullName) => {
        return await axiosClient.patch(`/chat/markAsRead/${userFullName}`);
    },
    getBoxChatMessages: async (boxChatId, participant) => {
        return await axiosClient.get(`/chat/getMessages/${boxChatId}?participant=${participant}`);
    },
}

export default chatApi;
