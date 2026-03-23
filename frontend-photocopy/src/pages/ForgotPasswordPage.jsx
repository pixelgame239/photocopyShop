import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/forgotpassword.css';
import { userApi } from '../api/user.api';

const ForgotPasswordPage = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0); // seconds remaining

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setLoading(true);
    try {
        await userApi.sendResetPasswordEmail(email);
        setSuccess('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
        setResendTimer(300); 
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="forgot-page-wrapper">
      <div className="forgot-card-container">
        <button className="forgot-btn-back" onClick={() => nav(-1)}>←</button>

        <div className="forgot-header-section">
          <h2>Quên mật khẩu</h2>
          <p className="forgot-subtitle">Nhập email để được đặt lại mật khẩu</p>
        </div>

        <form className="forgot-form-content" onSubmit={handleSubmit}>
          <div className="forgot-input-field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          {error && <p className="forgot-error-text">{error}</p>}
        {success && <p className="forgot-success-text">{success}</p>}
          <button type="submit" className="forgot-btn-submit" disabled={loading||resendTimer > 0||!email}>
            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
          </button>
            {resendTimer > 0 && <div className="forgot-resend-timer">Bạn có thể gửi lại sau {formatTime(resendTimer)}</div>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
