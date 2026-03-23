  import React, { useEffect, useState } from 'react';
  import '../styles/ordersPage.css';
  import ordersApi from '../api/orders.api';
  import { useContext } from 'react';
  import { UserContext } from '../context/UserContext';

  const OrderActionModal = ({ open, order, action, onClose, onConfirm }) => {
    const [totalAmount, setTotalAmount] = useState(order?.totalAmount || 0);
    const [pointsUsed, setPointsUsed] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentQR, setCurrentQR] = useState('');
    const { user, setUser } = useContext(UserContext);

    useEffect(() => {
      setTotalAmount(order?.totalAmount || 0);
      setPointsUsed(0);
      setCurrentQR('');
      setLoading(false);
    }, [order, open]);

    if (!open) return null;

    const userPoints = user?.userPoint || 0;
    const maxPointsPossible = Math.min(userPoints, Math.floor(Number(totalAmount) || 0));
    const sliderMax = Math.floor(maxPointsPossible / 100) * 100;

    const clampToHundreds = (v) => {
      const n = Math.max(0, Math.min(maxPointsPossible, Math.floor(Number(v) || 0)));
      return Math.floor(n / 100) * 100;
    };

    const handleConfirm = async () => {
      const ta = Number(totalAmount) || 0;
      const disc = Number(pointsUsed) || 0;
      setLoading(true);
      try {
        await ordersApi.changeOrderStatus({ orderId: order.id, action, totalAmount: ta, discount: disc });
        if (onConfirm) onConfirm(ta, disc);
        if (action === 'PROCESSING') {
          try {
            const payload = {
              userId: order.userId,
              phoneNumber: user.phoneNumber,
              totalAmount: ta-disc,
            };
            setUser({ ...user, userPoint: user.userPoint - pointsUsed });
            if(order.paymentOption === 'BANK_TRANSFER') {
              const resp = await ordersApi.getQRCode(payload);
              setCurrentQR(resp.data);
            }else {
            onClose();
            }
          } catch (qrErr) {
            console.error('Error fetching QR in modal:', qrErr);
          }
        } else {
          onClose();
        }
      } catch (err) {
        console.error('Error changing order status in modal:', err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-card">
          <h3>Xác nhận hành động: {action}</h3>

          {!currentQR && (
            <>
              {action === 'WAITING' && (
                <div>
                  <label>Tổng tiền (nhập số):</label>
                  <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
                </div>
              )}

              {action === 'PROCESSING' && order && order.status === 'WAITING' && (
                <div>
                  <div>Điểm hiện có: {userPoints}</div>
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="range"
                      min={0}
                      max={sliderMax}
                      step={100}
                      value={pointsUsed}
                      onChange={(e) => setPointsUsed(clampToHundreds(e.target.value))}
                      disabled={sliderMax <= 0}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={maxPointsPossible}
                      step={100}
                      value={pointsUsed}
                      onChange={(e) => setPointsUsed(clampToHundreds(e.target.value))}
                      disabled={sliderMax <= 0}
                    />
                    <div>Giảm: {pointsUsed.toLocaleString()} VND</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Hủy</button>
                <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </>
          )}

          {currentQR && (
            <div style={{ textAlign: 'center' }}>
              <h4>Mã QR thanh toán</h4>
              <div style={{ margin: 12 }}>
                <img src={currentQR} alt="QR code" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={onClose}>Đóng</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default OrderActionModal;
