import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/user.api";
import "../styles/profile.css";
import { TabContext } from "../context/TabContext";

const ProfilePage = () => {
  const { user, setUser } = useContext(UserContext);
  const nav = useNavigate();
const { setCurrentTab } = useContext(TabContext);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
    useEffect(() => {
    setCurrentTab("profile");
    if(!user||user.role === "GUEST"){
      nav("/login");
    }
  }, []);
  useEffect(() => {
    if (!user) return;
    setPhone(user.phoneNumber || "");
    setAddress(user.address || "");
  }, [user]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (phone.trim().length === 0 && address.trim().length === 0) {
      setError("Vui lòng nhập số điện thoại hoặc địa chỉ.");
      return;
    }
    setIsSaving(true);
    try {
     await userApi.updateProfile({ phoneNumber: phone, address });
      setUser((prev) => ({ ...prev, phoneNumber: phone, address }));
      setSuccess("Cập nhật thành công.");
      setIsEditing(false);
      setShowPasswordForm(false);
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật. Vui lòng thử lại sau.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetEdit = () => {
    setPhone(user.phoneNumber || "");
    setAddress(user.address || "");
    setIsEditing(false);
    setShowPasswordForm(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwdError("");
    setPwdSuccess("");
  };

  const validatePassword = () => {
    setPwdError("");
    if (!currentPassword || currentPassword.trim().length === 0) {
      setPwdError("Vui lòng nhập mật khẩu hiện tại.");
      return false;
    }
    if (!newPassword || newPassword.length < 6) {
      setPwdError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Mật khẩu xác nhận không khớp.");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    setPwdError("");
    setPwdSuccess("");
    if (!validatePassword()) return;
    try {
        await userApi.changePassword({ currentPassword, newPassword });
      setPwdSuccess('Mật khẩu đã được thay đổi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPwdError(err.response?.data?.message || "Không thể đổi mật khẩu. Vui lòng thử lại sau.");
    }
  }

  const initials = (user.fullName || "").split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase() || "U";

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-summary">
          <div className="avatar">{initials}</div>
          <h2 className="name">{user.fullName}</h2>
          <div className="email">{user.email}</div>
          <div className="points">Điểm: <strong>{user.userPoint}</strong></div>
        </div>

        <div className="profile-form">
          <h3>Thông tin liên hệ</h3>

              <label className="label">Họ và tên</label>
              <input className="profile-input" value={user.fullName} readOnly />

              <label className="label">Email</label>
              <input className="profile-input" value={user.email} readOnly />

              <label className="label">Số điện thoại</label>
              <input className="profile-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" readOnly={!isEditing} />

              <label className="label">Địa chỉ</label>
              <textarea className="profile-textarea" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ liên hệ" readOnly={!isEditing} />

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <div className="profile-actions">
            {!isEditing ? (
              <>
                <button className="profile-btn" onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
              </>
            ) : (
              <>
                <button className="profile-btn" onClick={resetEdit}>Hủy</button>
                <button className="profile-btn profile-btn-primary" onClick={handleSave} disabled={isSaving}>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              </>
            )}
            <button className="profile-btn" onClick={() => setShowPasswordForm(prev => !prev)}>{showPasswordForm ? 'Ẩn đổi mật khẩu' : 'Đổi mật khẩu'}</button>
          </div>

          {showPasswordForm && (
            <div className="password-card">
              <h4>Đổi mật khẩu</h4>
              <label className="label">Mật khẩu hiện tại</label>
              <input className="profile-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />

              <label className="label">Mật khẩu mới</label>
              <input className="profile-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

              <label className="label">Xác nhận mật khẩu mới</label>
              <input className="profile-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

              {pwdError && <div className="form-error">{pwdError}</div>}
              {pwdSuccess && <div className="form-success">{pwdSuccess}</div>}

              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
                <button className="profile-btn" onClick={() => { setShowPasswordForm(false); setPwdError(''); setPwdSuccess(''); }}>Hủy</button>
                <button className="profile-btn profile-btn-primary" onClick={handleChangePassword}>Đổi mật khẩu</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
