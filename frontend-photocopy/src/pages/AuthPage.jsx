import React, { useState } from 'react';
import '../styles/authpage.css';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ authMethod }) => {
    const nav = useNavigate();
     return (
        <div className="auth-page-wrapper">
        <div className="auth-card-container">
            {/* Nút quay lại ở góc form */}
            <button 
            className="btn-back" 
            onClick={() => nav("/")}
            aria-label="Quay lại"
            >
            <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#0e53f5ff"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>
            </button>

            <div className="auth-header-section">
            <h2>{authMethod==='login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</h2>
            <p className="auth-subtitle">
                {authMethod==='login' ? 'Chào mừng bạn quay trở lại' : 'Vui lòng điền thông tin bên dưới'}
            </p>
            </div>

            <form className="auth-form-content">
            {authMethod!=='login' && (
                <>
                <div className="input-field">
                    <label>Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn A" required />
                </div>
                <div className="input-field">
                    <label>Số điện thoại</label>
                    <input type="tel" placeholder="09xx xxx xxx" required />
                </div>
                </>
            )}

            <div className="input-field">
                <label>Email</label>
                <input type="email" placeholder="email@vi-du.com" required />
            </div>

            <div className="input-field">
                <label>Mật khẩu</label>
                <input type="password" placeholder="••••••••" required />
            </div>

            {!authMethod==='login' && (
                <div className="input-field">
                <label>Xác nhận mật khẩu</label>
                <input type="password" placeholder="••••••••" required />
                </div>
            )}

            <button type="submit" className="btn-submit-auth">
                {authMethod==='login' ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
            </form>

            <div className="auth-switch-mode">
            <a style={{cursor:"pointer"}} onClick={()=>{authMethod==='login'?nav("/signup"):nav("/login")}}>
                {authMethod==='login' 
                ? "Bạn chưa có tài khoản? Đăng ký" 
                : "Bạn đã có tài khoản? Đăng nhập"}
            </a>
            </div>
        </div>
        </div>
    );
    };

export default AuthPage;