import axiosClient from "./axiosClient";

const productApi = {
    getCategories: async () => {
        return await axiosClient.get(`/category`);
    },
    getProducts: async (page, size, searchTerm, categoryId) => {
        return await axiosClient.get(`/product`, {
            params: { page:page, size:size, searchTerm:searchTerm, categoryId:categoryId }
        });
    },
}
export default productApi;