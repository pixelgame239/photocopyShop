import { userApi } from "../api/user.api";
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { setAccessToken } from "../service/tokenService";
import "../styles/verificationSignup.css";

const VerificationSignup = () => {
    const [error, setError] = useState(null); 
    const { state } = useLocation();
    const { email, password, fullName, phoneNumber } = state || {};
    const [otp, setOtp] = useState('');
    const { setUser } = useContext(UserContext);
    const nav = useNavigate();

    const handleVerifyOTP = async () => {
        try{
        const response = await userApi.signup({email: email, password: password, fullName:fullName, phoneNumber: phoneNumber, otp: otp});
        setAccessToken(response.data.accessToken);
        setUser(response.data.userData);
        nav('/');
    } catch (err) {
        setError(err.response.data.message);
    }
}
    return (
        <div className="verification-signup-container">
            <p>Đã gửi mã OTP đến email của bạn. Vui lòng nhập mã OTP để hoàn tất quá trình đăng ký.</p>
            <div className="otp-inputs">
                <input type="text" maxLength="1" className="otp-input" value={otp[0] || ''} onChange={(e) => setOtp(prev => e.target.value + prev.substring(1))} />
                <input type="text" maxLength="1" className="otp-input" value={otp[1] || ''} onChange={(e) => setOtp(prev => prev[0] + e.target.value + prev.substring(2))} />
                <input type="text" maxLength="1" className="otp-input" value={otp[2] || ''} onChange={(e) => setOtp(prev => prev.substring(0,2) + e.target.value + prev.substring(3))} />
                <input type="text" maxLength="1" className="otp-input" value={otp[3] || ''} onChange={(e) => setOtp(prev => prev.substring(0,3) + e.target.value + prev.substring(4))} />
                <input type="text" maxLength="1" className="otp-input" value={otp[4] || ''} onChange={(e) => setOtp(prev => prev.substring(0,4) + e.target.value + prev.substring(5))} />
                <input type="text" maxLength="1" className="otp-input" value={otp[5] || ''} onChange={(e) => setOtp(prev => prev.substring(0,5) + e.target.value)} />
            </div>
            <button className="btn-verify-otp" onClick={handleVerifyOTP}>Xác nhận</button>
            {error && <p className="error-otp-text">{error}</p>}
        </div>
    )
}
export default VerificationSignup;