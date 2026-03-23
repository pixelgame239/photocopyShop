import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/resetpassword.css';
import { userApi } from '../api/user.api';

const ResetPasswordPage = () => {
  const nav = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      nav('/login');
      return;
    }
  }, [token]);

  const validate = () =>
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) {
      if (!newPassword || !confirmPassword) {
        setError('Mật khẩu không được để trống');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Mật khẩu không khớp');
        return;
      }
      if (newPassword.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      return;
    }
    setLoading(true);
    try {
      const response = await userApi.changePassword({ newPassword: newPassword, resetToken: token });
      console.log(response);
      setSuccess('Mật khẩu đã được đặt lại. Bạn sẽ được chuyển đến trang đăng nhập.');
      setTimeout(() => nav('/login'), 1800);
    } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || 'Lỗi kết nối server')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page-wrapper">
      <div className="reset-card-container">

        <div className="reset-header-section">
          <h2>Đặt mật khẩu mới</h2>
          <p className="reset-subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form className="reset-form-content" onSubmit={handleSubmit}>
          <div className="reset-input-field">
            <label>Mật khẩu mới</label>
            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>

          <div className="reset-input-field">
            <label>Xác nhận mật khẩu mới</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          {error && <p className="reset-error-text">{error}</p>}
          {success && <p className="reset-success-text">{success}</p>}

          <button type="submit" className="reset-btn-submit" disabled={loading || success}>{loading ? 'Đang xử lý...' : 'Đặt mật khẩu'}</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
