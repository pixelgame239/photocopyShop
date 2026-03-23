import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../styles/cartpage.css';
import ordersApi from '../api/orders.api';
import OrderSuccessModal from '../components/OrderSuccessModal';

const CheckoutPage = () => {
  const { user, setUser, setCartItemCount } = useContext(UserContext);
  const location = useLocation();
  const initialCart = (location.state && location.state.cart) ? location.state.cart : [];
  const [cart, setCart] = useState(initialCart);
  const [orderType, setOrderType] = useState('PICKUP');
  const [address, setAddress] = useState(user?.address || '');
  const [paymentOption, setPaymentOption] = useState('CASH');
  const [pointsUsed, setPointsUsed] = useState(0);
  const [currentQR, setCurrentQR] = useState('');
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (user && user.role && user.role !== 'USER') {
      nav('/login');
    }
  }, [user, nav]);

  useEffect(() => {
    if (!cart || cart.length === 0) {
      nav('/');
    }
  }, []);
  
  const total = cart.reduce((s, i) => s + (Number(i.productPrice) || 0) * Number(i.quantity || 0), 0);
  const userPoints = Number(user?.userPoint || 0);
  const maxPointsPossible = Math.min(userPoints, Math.floor(total));
  const discount = Math.min(Math.max(0, Math.floor(pointsUsed || 0)), maxPointsPossible);
  const finalTotal = Math.max(0, total - discount);

  const sliderMax = Math.floor(maxPointsPossible / 100) * 100;
  const clampToHundreds = (v) => {
    const n = Math.max(0, Math.min(maxPointsPossible, Math.floor(Number(v) || 0)));
    return Math.floor(n / 100) * 100;
  };

  const formatVnd = (num) => num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const handleSubmit = async () => {
    try{
       if (orderType === 'DELIVERY' && address.trim() === '') {
      alert('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
      const orderData = {
        totalAmount: finalTotal,
        discount: discount,
        orderType: orderType,
        address: orderType === 'DELIVERY' ? address : 'Nhận tại cửa hàng',
        paymentOption: paymentOption,
      };
      const response = await ordersApi.createOrder(orderData);
      setOrderSuccessOpen(true);
      setCart([]);
      setCartItemCount(0);
      if (user) {
        const updated = { ...user, userPoint: response.data };
        setUser(updated);
      }
    }
    catch(err){
      console.error('Error creating order:', err);
      alert('Đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    }
  };
  const handleTransferMethod = async () => {
    if (currentQR.trim()!=="") {
      setPaymentOption('BANK_TRANSFER');
      return;
    }
    try {
      const response = await ordersApi.getQRCode({ userId: user.id, phoneNumber: user.phoneNumber, totalAmount: finalTotal });
      setCurrentQR(response.data);
      setPaymentOption('BANK_TRANSFER');
    } catch (error) {
      console.error('Error fetching payment QR code:', error);
      alert('Không thể lấy mã QR. Vui lòng thử lại sau.');
    }
  }
  return (
    <div style={{ padding: 20 }}>
      <h2>Thanh toán</h2>

      {(!cart || cart.length === 0) ? (
        <div className="page-empty">
          <p className="empty-cart">Không có sản phẩm trong giỏ hàng.</p>
        </div>
      ) : (
        <div className="checkout-grid">
          <div className="checkout-left">
            <div className="card">
              <h3>Đơn hàng</h3>
              <div className="order-summary">
                {cart.map((it) => (
                  <div className="order-item" key={it.cartId || it.id}>
                    <img src={it.productUrl || 'https://via.placeholder.com/80?text=No+Image'} alt={it.productName} className="checkout-item-image" />
                    <div className="order-item-info">
                      <div className="order-item-name">{it.productName}</div>
                      <div className="order-item-meta">Số lượng: {it.quantity}</div>
                    </div>
                    <div className="order-item-line-total">{formatVnd((Number(it.productPrice) || 0) * Number(it.quantity || 0))}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Hình thức nhận hàng</h3>
              <div className="options-grid">
                <div className={`option-card ${orderType === 'PICKUP' ? 'active' : ''}`} onClick={() => setOrderType('PICKUP')}>
                  <input type="radio" name="shipping" value="PICKUP" checked={orderType === 'PICKUP'} readOnly />
                  <div>
                    <div className="option-title">Nhận tại cửa hàng</div>
                    <div className="option-desc">Lấy hàng trực tiếp tại cửa hàng</div>
                  </div>
                </div>

                <div className={`option-card ${orderType === 'DELIVERY' ? 'active' : ''}`} onClick={() => setOrderType('DELIVERY')}>
                  <input type="radio" name="shipping" value="DELIVERY" checked={orderType === 'DELIVERY'} readOnly />
                  <div>
                    <div className="option-title">Ship hàng</div>
                    <div className="option-desc">Giao tới địa chỉ của bạn</div>
                  </div>
                </div>
              </div>
              {orderType === 'DELIVERY' && (
                <>
                  <div style={{ marginTop: 12 }}>
                    <input
                      type="text"
                      placeholder="Địa chỉ giao hàng"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ width: '96%', padding: 10, borderRadius: 8, border: '1px solid #e6e6e6' }}
                    />
                  </div>
                  <div className="shipping-note">Số tiền trên chưa bao gồm phí vận chuyển, phí vận chuyển sẽ được shipper tính thêm</div>
                  <div className="shipping-note">Địa chỉ trên là địa chỉ mặc định bạn đã đăng ký, nếu chưa có thì bạn có thể vào hồ sơ để cập nhật địa chỉ. Nếu bạn chưa có địa chỉ, địa chỉ trên sẽ tự động cập nhật thành địa chỉ mặc định của bạn.</div>
                </>
              )}
            </div>

            <div className="card">
              <h3>Hình thức thanh toán</h3>
              <div className="options-grid">
                <div className={`option-card ${paymentOption === 'CASH' ? 'active' : ''}`} onClick={() => setPaymentOption('CASH')}>
                  <input type="radio" name="payment" value="CASH" checked={paymentOption === 'CASH'} readOnly />
                  <div>
                    <div className="option-title">Tiền mặt</div>
                    <div className="option-desc">Thanh toán khi nhận hàng</div>
                  </div>
                </div>

                <div className={`option-card ${paymentOption === 'BANK_TRANSFER' ? 'active' : ''}`} onClick={async () => await handleTransferMethod()}>
                  <input type="radio" name="payment" value="BANK_TRANSFER" checked={paymentOption === 'BANK_TRANSFER'} readOnly />
                  <div>
                    <div className="option-title">Chuyển khoản</div>
                    <div className="option-desc">Quét mã QR hoặc chuyển khoản</div>
                  </div>
                </div>
              </div>

              {paymentOption === 'BANK_TRANSFER' && (
                <div className="qr-box">
                  <img src={currentQR} alt="QR code" />
                </div>
              )}
            </div>
          </div>

          <aside className="checkout-right">
            <div className="summary-card">
              <div className="summary-lines">
                <div className="summary-line"><div className="label">Tạm tính</div><div>{formatVnd(total)}</div></div>
                <div className="summary-line"><div className="label">Giảm (điểm)</div><div>-{formatVnd(discount)}</div></div>
              </div>

              <div className="points-control">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  </div>
                  <div className="points-available">Bạn có {userPoints} điểm</div>
                </label>

                <div>
                  <input
                    className="points-slider"
                    type="range"
                    min={0}
                    max={sliderMax}
                    step={100}
                    value={pointsUsed}
                    onChange={(e) => setPointsUsed(clampToHundreds(e.target.value))}
                    disabled={sliderMax <= 0}
                  />
                </div>

                <div className="points-input-row">
                  <input
                    className="points-input"
                    type="number"
                    min={0}
                    max={maxPointsPossible}
                    step={100}
                    value={pointsUsed}
                    onChange={(e) => setPointsUsed(clampToHundreds(e.target.value))}
                    disabled={sliderMax <= 0}
                  />
                  <button className="btn btn-ghost" type="button" onClick={() => setPointsUsed(sliderMax)}>Dùng tối đa</button>
                  <div className="points-summary">Giảm: {formatVnd(pointsUsed)}</div>
                </div>

                <div className="final-total-row">
                  <div>Giảm: {formatVnd(discount)}</div>
                  <div className="final-total">Tổng phải trả: {formatVnd(finalTotal)}</div>
                </div>
              </div>

              <div className="summary-actions">
                <button className="btn btn-ghost" onClick={() => nav("/cart")}>Quay lại</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Xác nhận đơn hàng</button>
              </div>
            </div>
          </aside>
        </div>
      )}
      <OrderSuccessModal
        open={orderSuccessOpen}
        onBack={() => nav('/')}
      />
    </div>
  );
};

export default CheckoutPage;
