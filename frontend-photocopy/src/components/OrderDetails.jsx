import React, { useEffect, useState } from "react";
import ordersApi from "../api/orders.api";

const OrderDetails = ({ order }) => {
  const [fileLink, setFileLink] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

useEffect(() => {
  let mounted = true;
  
  const fetchFile = async () => {
    const fileName = order?.serviceOrder?.fileName;
    if (!fileName) return;

    setLoadingFile(true);
    try {
      const res = await ordersApi.getOrderFile(fileName); 
      if (mounted) {
        const url = typeof res.data === 'string' ? res.data : res.data.url;
        setFileLink(url);
      }
    } catch (err) {
      console.error("Error fetching signed URL:", err);
    } finally {
      if (mounted) setLoadingFile(false);
    }
  };

  fetchFile();
  return () => { mounted = false; };
}, [order]);

  return (
    <div className="orders-service-detail">
      {order?.serviceOrder?.serviceDescription && (
        <>
        <div className="service-desc">Mô tả yêu cầu: {order.serviceOrder.serviceDescription}</div>
        {order.discount ? <div className="service-discount">Giảm giá: {order.discount.toLocaleString()} VND</div> : null}
        {order.totalAmount ? <div className="service-amount">Tổng tiền: {order.totalAmount.toLocaleString()} VND</div> : null}
        </>
      )}
      {loadingFile && <div className="service-loading">Đang tải tập tin...</div>}
      {!loadingFile && fileLink && (
        <div className="service-files">
          <div className="service-file-item">
            <span>File: </span>
            <a href={fileLink} className="service-file-link" download target="_blank" rel="noopener noreferrer">
              {order.serviceOrder.fileName}
            </a>
          </div>
        </div>
      )}
      {order?.productOrders && order.productOrders.length > 0 && (
        <div className="orders-products">
          {(order.productOrders || []).map((po) => (
            <div key={po.productId} className="orders-product">
              <div className="prod-name">{po.productName}</div>
              <div className="prod-qty">x{po.quantity}</div>
              <div className="prod-price">{((po.price || 0) * (po.quantity || 0)).toLocaleString()}₫</div>
            </div>
          ))}
          <div className="orders-discount">Giảm giá: {(order.discount || 0).toLocaleString()}₫</div>
          <div className="orders-total">Tổng: {(order.totalAmount || 0).toLocaleString()}₫</div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
