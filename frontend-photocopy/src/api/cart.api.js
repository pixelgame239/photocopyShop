import axiosClient from "./axiosClient"

const cartApi = {
  getCart: async () => {
    const response = await axiosClient.get('/cart');
    return response;
  },
  getCartItemCount: async () => {
    const response = await axiosClient.get('/cart/count');
    return response;
  },
  addToCart: async (productId) => {
    const response = await axiosClient.post(`/cart/add/${productId}`);
    return response;
  },
  updateCartItem: async (cartId, quantity) => {
    const response = await axiosClient.patch(`/cart/update/${cartId}?quantity=${quantity}`);
    return response;
  },
  removeCartItem: async (cartId) => {
    const response = await axiosClient.delete(`/cart/remove/${cartId}`);
    return response;
  }
}

export default cartApi;