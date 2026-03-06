import { userApi } from "../api/user.api";
import { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { setAccessToken } from "../service/tokenService";
import "../styles/verificationSignup.css";

const VerificationSignup = () => {
    const [error, setError] = useState(null);
    const { state } = useLocation();
    const { email, password, fullName, phoneNumber } = state || {};
    const [otp, setOtp] = useState(Array(6).fill(''));
    const inputsRef = useRef([]);
    const [secondsRemaining, setSecondsRemaining] = useState(5 * 60); // 5 minutes
    const { setUser } = useContext(UserContext);
    const nav = useNavigate();

    const handleVerifyOTP = async () => {
        const otpStr = otp.join('');
        try{
            const response = await userApi.signup({email: email, password: password, fullName:fullName, phoneNumber: phoneNumber, otp: otpStr});
            setAccessToken(response.data.accessToken);
            setUser(response.data.userData);
            nav('/');
        } catch (err) {
            setError(err?.response?.data?.message || 'Verification failed');
        }
    }

    useEffect(() => {
        if (secondsRemaining <= 0) return;
        const id = setInterval(() => setSecondsRemaining(s => s - 1), 1000);
        return () => clearInterval(id);
    }, [secondsRemaining]);

    useEffect(() => {
        // focus first input on mount
        if (inputsRef.current[0]) inputsRef.current[0].focus();
    }, []);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    }

    const handleResend = async () => {
        if (secondsRemaining > 0) return;
        try {
            await userApi.sendVerification({ email: email , fullName: fullName, phoneNumber: phoneNumber, password: password});
            setSecondsRemaining(5 * 60);
            setError(null);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to resend code');
        }
    }
    return (
        <div className="verification-signup-container">
            <p>Chúng tôi đã gửi mã OTP gồm 6 chữ số tới email của bạn. Vui lòng nhập mã để hoàn tất đăng ký.</p>
            <div className="otp-inputs">
                {otp.map((digit, idx) => (
                    <input
                        key={idx}
                        ref={el => inputsRef.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className="otp-input"
                        value={digit}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0,1);
                            setOtp(prev => {
                                const copy = [...prev];
                                copy[idx] = val;
                                return copy;
                            });
                            if (val && idx < 5) {
                                inputsRef.current[idx + 1]?.focus();
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                                if (otp[idx]) {
                                    setOtp(prev => {
                                        const copy = [...prev];
                                        copy[idx] = '';
                                        return copy;
                                    });
                                } else if (idx > 0) {
                                    inputsRef.current[idx - 1]?.focus();
                                    setOtp(prev => {
                                        const copy = [...prev];
                                        copy[idx - 1] = '';
                                        return copy;
                                    });
                                }
                            }
                        }}
                        onPaste={(e) => {
                            e.preventDefault();
                            const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
                            const digits = paste.replace(/\D/g, '').split('').slice(0,6);
                            if (digits.length) {
                                setOtp(prev => {
                                    const copy = [...prev];
                                    for (let i = 0; i < 6; i++) copy[i] = digits[i] || '';
                                    return copy;
                                });
                                const focusIdx = Math.min(digits.length, 5);
                                inputsRef.current[focusIdx]?.focus();
                            }
                        }}
                    />
                ))}
            </div>
            <button className="btn-verify-otp" onClick={handleVerifyOTP} disabled={otp.join('').length < 6}>Xác nhận</button>

            <div style={{marginTop: 12}}>
                {secondsRemaining > 0 ? (
                    <p className="resend-text">Bạn có thể yêu cầu mã mới sau <strong>{formatTime(secondsRemaining)}</strong>.</p>
                ) : (
                    <p className="resend-text">Không nhận được mã? <button className="resend-btn" onClick={handleResend}>Gửi lại mã</button></p>
                )}
            </div>

            {error && <p className="error-otp-text">{error}</p>}
        </div>
    )
}
export default VerificationSignup;