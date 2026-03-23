import axiosClient from "./axiosClient";

const adminApi = {
    getDashboardStats: async () => {
        return await axiosClient.get("/admin/dashboard");
    },
    createCategory: async (formData) => {
        return await axiosClient.post("/admin/category/create", { categoryName: formData.categoryName });
    },
    updateCategory: async (formData) => {
        return await axiosClient.put("/admin/category/update", formData);
    },
    deleteCategory: async (categoryId) => {
        return await axiosClient.delete(`/admin/category/delete/${categoryId}`);
    },
    createProduct: async (formData) => {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        return await axiosClient.post("/admin/product/createProduct", formData, config);
    },
    deleteProduct: async (productId) => {
        return await axiosClient.delete(`/admin/product/delete/${productId}`);
    },
    updateProduct: async (productId, formData) => {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        return await axiosClient.put(`/admin/product/update/${productId}`, formData, config);
    },
    getUsers: async (page, size) => {
        return await axiosClient.get(`/admin/users?page=${page}&size=${size}`);
    },
    updateUserStatus: async (userId) => {
        return await axiosClient.post(`/admin/users/changeStatus/${userId}`);
    },
    deleteUser: async (userId) => {
        return await axiosClient.delete(`/admin/users/delete/${userId}`);
    },
    createStaff: async (formData) => {
        return await axiosClient.post("/admin/users/createStaff", formData);
    },
    getAllOrders: async (page, size) => {
        return await axiosClient.get(`/orders/getAllOrders?page=${page}&size=${size}`);
    },
    deleteOrder: async (orderId) => {
        return await axiosClient.delete(`/admin/orders/delete/${orderId}`);
    }
}
export default adminApi;