import React, { useContext, useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";
import ordersApi from "../api/orders.api";
import OrderDetails from "../components/OrderDetails";
import Pagination from "../components/Pagination";
import OrderActionModal from "../components/OrderActionModal";
import { toast } from "react-toastify";
import "../styles/ordersPage.css";
import { TabContext } from "../context/TabContext";
import { UserContext } from "../context/UserContext";
import adminApi from "../api/admin.api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [totalPage, setTotalPage] = useState(1);
  const { setCurrentTab} = useContext(TabContext);
  const { user, setUnreadOrder } = useContext(UserContext);

  useEffect(() => {
    setCurrentTab('orders');
    setUnreadOrder(false);
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let response;
        if (user && user.role === "USER") {
          response = await ordersApi.getUserOrders(page, 10);
        } else if (user && (user.role === "STAFF" || user.role === "ADMIN")) {
          response = await adminApi.getAllOrders(page, 10);
        }
        setOrders(response.data.content || []);
        console.log("Fetched user orders:", response.data);
        setTotalPage(response.data.page.totalPages || 1);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, page]);

  const handleExport = async (orderId) => {
    try {
      await ordersApi.exportInvoice(orderId);
      toast.success("Đã xuất hóa đơn");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xuất hóa đơn");
    }
  };

  const handleAction = async(order, action, totalAmount, discount) => {
    try {
      const orderStatusData = { orderId: order.id, action: action, totalAmount: totalAmount, discount: discount };
      await ordersApi.changeOrderStatus(orderStatusData);
      toast.success("Trạng thái đơn hàng đã được cập nhật");
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: action } : o));
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  const openModal = (order, action) => {
    setModalOrder(order);
    setModalAction(action);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalOrder(null);
    setModalAction(null);
  };

  const handleModalConfirm = (totalAmount, discount) => {
    if (!modalOrder || !modalAction) return;
    setOrders((prev) => prev.map((o) => o.id === modalOrder.id ? { ...o, status: modalAction, totalAmount, discount } : o));
  };

  const toggleExpand = (id) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }))
  };

  const renderDetails = (o) => {
    if (o.productOrders && o.productOrders.length > 0) {
      return (
        <div className="orders-products">
          {(o.productOrders || []).map((po) => (
            <div key={po.productId} className="orders-product">
              <div className="prod-name">{po.productName}</div>
              <div className="prod-qty">x{po.quantity}</div>
              <div className="prod-price">{(po.price * po.quantity || 0).toLocaleString()}₫</div>
            </div>
          ))}
          <div className="orders-discount">Giảm giá: {(o.discount || 0).toLocaleString()}₫</div>
          <div className="orders-total">Tổng: {(o.totalAmount || 0).toLocaleString()}₫</div>
        </div>
      );
    }
    return null; 
  };

  return (
    <div className="orders-wrap">
      <h2 className="orders-title">Quản lý đơn hàng</h2>
      
      {loading && <div className="orders-loading">Đang tải...</div>}
      {error && <div className="orders-error">Lỗi: {String(error)}</div>}
      <section className="orders-section">
        <h3 className="orders-section-title">Tất cả đơn hàng</h3>
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o.id} className={`orders-tile ${!o.productOrders || o.productOrders.length === 0 ? 'orders-tile-service' : ''}`}>
              <div className="orders-row">
                <div className="orders-main">
                  <div className="orders-id">Order: {o.id}</div>
                  <div className="orders-customer">{o.fullName}</div>
                  <div className="orders-meta">{o.orderDate}</div>
                  {o.status && <div className="orders-status">Trạng thái: {o.status}</div>}
                  {o.paymentOption && <div className="orders-payment">Thanh toán: {o.paymentOption}</div>}
                  {o.orderType && <div className="orders-type">Loại: {o.orderType}</div>}
                  {(o.address) && (
                    <div className="orders-address">Địa chỉ nhận hàng: {o.address}</div>
                  )}
                </div>
                <div className="orders-ops">
                  <button className="op-btn" onClick={() => toggleExpand(o.id)} aria-expanded={!!expanded[o.id]}> {expanded[o.id] ? 'Thu gọn' : 'Chi tiết'} </button>
                  {o.status === 'PENDING' && user && user.role === "USER" && (
                      <button className="op-btn" onClick={() => handleAction(o, 'CANCELLED')}>Hủy</button>
                  )}
                  {o.status === 'PENDING' && (user && (user.role === "STAFF" || user.role === "ADMIN")) && (
                    <>
                      {o.serviceOrder && o.serviceOrder.serviceDescription && (
                        <button className="op-btn" onClick={() => openModal(o, 'WAITING')}>Duyệt</button>
                      )}
                      <button className="op-btn" onClick={() => handleAction(o, 'REJECTED')}>Từ chối</button>
                      <button className="op-btn" onClick={() => handleAction(o, 'PROCESSING')}>Xử lý</button>
                    </>
                  )}
                    {o.status === 'WAITING' && (user && user.role === "USER") && (
                      <button className="op-btn" onClick={() => openModal(o, 'PROCESSING')}>Đồng ý</button>
                    )}
                  {o.status === 'PROCESSING' && o.orderType === 'DELIVERY' && (user && (user.role === "STAFF" || user.role === "ADMIN")) && (
                    <button className="op-btn" onClick={() => handleAction(o, 'SHIPPING')}>Giao hàng</button>
                  )}
                  {(o.status === 'PROCESSING' && o.orderType === 'PICKUP') || (o.status === 'SHIPPING') && (user && (user.role === "STAFF" || user.role === "ADMIN")) && (
                    <button className="op-btn" onClick={() => handleAction(o, 'COMPLETED')}>Hoàn thành</button>
                  )}
                  {o.status ==="COMPLETED" && (
                    <>
                      <button className="op-btn" onClick={() => handleExport(o.id)}>Xuất hóa đơn</button>
                      {user && (user.role === "STAFF" || user.role === "ADMIN") && (
                        <button className="op-btn" onClick={() => handleAction(o, 'FAILED')}>Thất bại</button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {expanded[o.id] && (o.productOrders && o.productOrders.length > 0 ? renderDetails(o) : <OrderDetails order={o} />)}
            </div>
          ))}
        </div>
        <div className="orders-pager">
          <Pagination currentPage={page} totalPages={totalPage} onPageChange={setPage} maxVisible={5} />
        </div>
      </section>
      <OrderActionModal
        open={modalOpen}
        order={modalOrder}
        action={modalAction}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
      />
      
    </div>
  );
};

export default OrdersPage;
