import React, { useState } from 'react';
import '../styles/authpage.css';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user.api';

const AuthPage = ({ authMethod }) => {
  const nav = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = () => {
    return form.password === confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authMethod === 'signup' && !validatePassword()) {
      setError('Mật khẩu không khớp');
      return;
    }

    try {
      setLoading(true);

      if (authMethod === 'signup') {
        await userApi.createUser(form);
        alert('Đăng ký thành công');
        nav('/login');
      }

      if (authMethod === 'login') {
        // TODO: gọi API login
        console.log('Login form:', form);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">

        <button className="btn-back" onClick={() => nav('/')}>
          ←
        </button>

        <div className="auth-header-section">
          <h2>{authMethod === 'login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</h2>
          <p>
            {authMethod === 'login'
              ? 'Chào mừng bạn quay trở lại'
              : 'Vui lòng điền thông tin bên dưới'}
          </p>
        </div>

        <form className="auth-form-content" onSubmit={handleSubmit}>

          {authMethod !== 'login' && (
            <>
              <div className="input-field">
                <label>Họ và tên</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                />
              </div>

              <div className="input-field">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={form.phoneNumber}
                  onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="input-field">
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="input-field">
            <label>Mật khẩu</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {authMethod !== 'login' && (
            <div className="input-field">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            disabled={loading || (authMethod === 'signup' && !validatePassword())}
            className="btn-submit-auth"
          >
            {loading
              ? 'Đang xử lý...'
              : authMethod === 'login'
              ? 'Đăng nhập'
              : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-switch-mode">
          <span
            onClick={() =>
              authMethod === 'login' ? nav('/signup') : nav('/login')
            }
          >
            {authMethod === 'login'
              ? 'Bạn chưa có tài khoản? Đăng ký'
              : 'Bạn đã có tài khoản? Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
