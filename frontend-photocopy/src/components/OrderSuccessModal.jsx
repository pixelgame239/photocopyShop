import React from 'react';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modalStyle = {
  background: '#fff',
  padding: 24,
  borderRadius: 8,
  width: '92%',
  maxWidth: 520,
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  textAlign: 'center',
};

const actionsStyle = {
  marginTop: 18,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
};

const OrderSuccessModal = ({ open, onBack = () => {} }) => {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Đơn hàng đã được tạo thành công</h3>
          <p style={{ marginTop: 8 }}>Cảm ơn bạn, đơn hàng của bạn đã được ghi nhận.</p>
        <div style={actionsStyle}>
          <button className="btn btn-ghost" onClick={onBack}>Quay lại</button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
