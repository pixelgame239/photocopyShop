import axiosClient from "./axiosClient"

const ordersApi = {
    getQRCode: (data) => {
        return axiosClient.post(`/orders/generateQRCode`, data);
    },
    createOrder: async (orderData) => {
        const response = await axiosClient.post('/orders/createOrder', orderData);
        return response;
    },
    createServiceOrder: async (serviceOrderData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        const response = await axiosClient.post('/orders/createServiceOrder', serviceOrderData, config);
        return response;
    },
    exportInvoice: async (orderId) => {
        const response = await axiosClient.get(`/orders/exportInvoice/${orderId}`, {
            responseType: 'blob',
        });
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
    getUserOrders: async (page, size) => {
        const response = await axiosClient.get(`/orders/getUserOrders?page=${page}&size=${size}`);
        return response;
    },
    getOrderFile: async (fileName) => {
        const response = await axiosClient.get(`/orders/getOrderFile?fileName=${encodeURIComponent(fileName)}`);
        return response;
    },
    changeOrderStatus: async (orderStatusData) => {
        const response = await axiosClient.patch('/orders/changeOrderStatus', orderStatusData);
        return response;
    },
    getOrdersStatus: async () => {
        const response = await axiosClient.get(`/orders/getOrdersStatus`);
        return response;
    }
}

export default ordersApi;